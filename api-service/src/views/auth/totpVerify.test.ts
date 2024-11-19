import { ErrorResponse, TotpVerify200Response } from '@unconventional-jackson/avoca-internal-api';
import { Express } from 'express';
import * as speakeasy from 'speakeasy';
import request from 'supertest';

import { main } from '../../app';
import { EmployeeModel } from '../../models/models/Employees';

describe('views/Auth/totpVerify', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });
  describe('success cases', () => {
    describe('when the TOTP token is valid', () => {
      it('verifies the TOTP successfully', async () => {
        // Create a user with a TOTP secret
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        await EmployeeModel.update(
          {
            auth_totp_secret: 'SECRET_TOTP_KEY',
          },
          { where: { email: 'test@example.com' } }
        );

        // Generate the valid TOTP token using speakeasy
        const validToken = speakeasy.totp({
          secret: 'SECRET_TOTP_KEY',
          encoding: 'ascii',
        });

        // Verify the TOTP token
        const response = await request(app).post('/auth/totp/verify').send({
          email: 'test@example.com',
          token: validToken,
        });

        const body = response.body as TotpVerify200Response;
        expect(response.status).toBe(201);
        expect(body.message).toBe('TOTP verified successfully');
      });
    });
  });

  describe('failure cases', () => {
    describe('when the email is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/totp/verify').send({
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('Missing email in the body.');
      });
    });

    describe('when the token is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/totp/verify').send({
          email: 'test@example.com',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No token value.');
      });
    });

    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/totp/verify').send({
          email: 'nonexistent@example.com',
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });
    describe('when the TOTP secret is not set up', () => {
      it('throws an error', async () => {
        // Create a user without a TOTP secret
        await request(app).post('/auth/signup').send({
          email: 'test_no_totp@example.com',
          password: 'password123',
        });

        const response = await request(app).post('/auth/totp/verify').send({
          email: 'test_no_totp@example.com',
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(404);
        expect(body.error).toBe('TOTP not set up');
      });
    });

    describe('when the TOTP token is invalid', () => {
      it('throws an error', async () => {
        // Create a user with a TOTP secret
        await request(app).post('/auth/signup').send({
          email: 'test_invalid_totp@example.com',
          password: 'password123',
        });

        await EmployeeModel.update(
          {
            auth_totp_secret: 'SECRET_TOTP_KEY',
          },
          { where: { email: 'test_invalid_totp@example.com' } }
        );

        const response = await request(app).post('/auth/totp/verify').send({
          email: 'test_invalid_totp@example.com',
          token: 'invalid_token', // Invalid token
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid TOTP token');
      });
    });
  });
});
