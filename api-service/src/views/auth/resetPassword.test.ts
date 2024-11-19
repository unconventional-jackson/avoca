import {
  ErrorResponse,
  ResetPassword200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { compare } from 'bcrypt';
import { Express } from 'express';
import * as speakeasy from 'speakeasy';
import request from 'supertest';

import { main } from '../../app';
import { EmployeeModel, getEmployeeId } from '../../models/models/Employees';
describe('views/Auth/resetPassword', () => {
  let app: Express;

  beforeAll(async () => {
    app = await main(true);
  });

  describe('success cases', () => {
    describe('when the password reset is successful', () => {
      it('updates the password and returns success', async () => {
        // Sign up a user
        const email = getEmployeeId();
        await request(app).post('/auth/signup').send({
          email,
          password: 'old_password',
        });

        const employee = await EmployeeModel.findOne({ where: { email } });
        const token = speakeasy.totp({
          secret: employee?.auth_totp_secret ?? '',
          encoding: 'ascii',
          digits: 6,
        });

        // Call the reset-password endpoint
        const response = await request(app).post('/auth/reset-password').send({
          email,
          new_password: 'newPassword123',
          token,
        });

        const body = response.body as ResetPassword200Response;
        expect(response.status).toBe(200);
        expect(body.message).toBe('Password updated');

        // Verify the password was updated
        const updatedEmployee = await EmployeeModel.findOne({
          where: { email },
        });
        if (updatedEmployee?.auth_password_hash) {
          const isPasswordUpdated = await compare(
            'newPassword123',
            updatedEmployee.auth_password_hash
          );
          expect(isPasswordUpdated).toBe(true);
        } else {
          throw new Error('Password hash is not set');
        }
      });
    });
  });

  describe('failure cases', () => {
    describe('when the new password is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/reset-password').send({
          email: getEmployeeId(),
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing new_password in the body.');
      });
    });

    describe('when the token is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/reset-password').send({
          email: getEmployeeId(),
          new_password: 'newPassword123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing token in the body.');
      });
    });

    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/reset-password').send({
          email: getEmployeeId(),
          new_password: 'newPassword123',
          token: 'non_existent_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });

    describe('when the token is invalid', () => {
      it('throws an error', async () => {
        // Sign up a user and set a valid token
        const email = getEmployeeId();
        await request(app).post('/auth/signup').send({
          email,
          password: 'password123',
        });

        // Call reset password with an invalid token
        const response = await request(app).post('/auth/reset-password').send({
          email,
          new_password: 'newPassword123',
          token: 'invalid_token', // Incorrect token
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid TOTP token');
      });
    });
  });
});
