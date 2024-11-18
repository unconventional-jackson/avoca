import {
  ErrorResponse,
  ResetPassword200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { compare } from 'bcrypt';
import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { UserModel } from '../../models/models/Users';
describe('views/Auth/resetPassword', () => {
  let app: Express;

  beforeAll(async () => {
    app = await main(true);
  });

  describe('success cases', () => {
    describe('when the password reset is successful', () => {
      it('updates the password and returns success', async () => {
        // Sign up a user
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'old_password',
        });

        // Set a reset password token
        const resetToken = 'valid_token';
        await UserModel.update(
          { authResetPasswordToken: resetToken },
          { where: { email: 'test@example.com' } }
        );

        // Call the reset-password endpoint
        const response = await request(app).post('/auth/reset-password').send({
          newPassword: 'newPassword123',
          token: resetToken,
        });

        const body = response.body as ResetPassword200Response;
        expect(response.status).toBe(200);
        expect(body.message).toBe('Password updated');

        // Verify the password was updated
        const updatedAdmin = await UserModel.findOne({ where: { email: 'test@example.com' } });
        if (updatedAdmin?.authPasswordHash) {
          const isPasswordUpdated = await compare('newPassword123', updatedAdmin.authPasswordHash);
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
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No newPassword value.');
      });
    });

    describe('when the token is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/reset-password').send({
          newPassword: 'newPassword123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No token value.');
      });
    });

    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/reset-password').send({
          newPassword: 'newPassword123',
          token: 'non_existent_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Token not found');
      });
    });

    describe('when the user does not have a reset token set', () => {
      it('throws an error', async () => {
        // Sign up a user without a reset token
        await request(app).post('/auth/signup').send({
          email: 'test_no_token@example.com',
          password: 'password123',
        });

        const response = await request(app).post('/auth/reset-password').send({
          newPassword: 'newPassword123',
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Token not found');
      });
    });

    describe('when the token is invalid', () => {
      it('throws an error', async () => {
        // Sign up a user and set a valid token
        await request(app).post('/auth/signup').send({
          email: 'test_invalid_token@example.com',
          password: 'password123',
        });

        // Set a valid token for the user in the database
        await UserModel.update(
          { authResetPasswordToken: 'valid_token' },
          { where: { email: 'test_invalid_token@example.com' } }
        );

        // Call reset password with an invalid token
        const response = await request(app).post('/auth/reset-password').send({
          newPassword: 'newPassword123',
          token: 'invalid_token', // Incorrect token
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Token not found');
      });
    });
  });
});
