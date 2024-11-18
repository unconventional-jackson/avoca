import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { UserModel } from '../../models/models/Users';
import { AuthResendVerificationResponseBody } from './resendVerification';

describe('views/Auth/resendVerification', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });
  describe('success cases', () => {
    describe('when the user requests to resend verification', () => {
      it('resends the verification email successfully', async () => {
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        await UserModel.update(
          {
            authEmailVerified: false,
            // authEmailVerificationToken,
            authStatus: 'pendingVerification',
          },
          { where: { email: 'test@example.com' } }
        );

        const response = await request(app).post('/auth/resend-verification').send({
          email: 'test@example.com',
        });

        const body = response.body as AuthResendVerificationResponseBody;
        expect(response.status).toBe(201);
        expect(body.message).toBe('Verification email resent. Verify your email.');

        const updatedUser = await UserModel.findOne({ where: { email: 'test@example.com' } });
        expect(updatedUser?.authEmailVerified).toBe(false);
        expect(updatedUser?.authEmailVerificationToken).not.toBeNull();
      });
    });
  });

  describe('failure cases', () => {
    describe('when the email is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/resend-verification').send({});

        const body = response.body as AuthResendVerificationResponseBody;
        expect(response.status).toBe(400);
        expect(body.message).toBe('Missing email in the body.');
      });
    });

    describe('when the user is already verified', () => {
      it('throws an error', async () => {
        // Create a user and verify them
        await request(app).post('/auth/signup').send({
          email: 'test_verified@example.com',
          password: 'password123',
        });

        await UserModel.update(
          { authEmailVerified: true },
          { where: { email: 'test_verified@example.com' } }
        );

        // Try to resend verification
        const response = await request(app).post('/auth/resend-verification').send({
          email: 'test_verified@example.com',
        });

        const body = response.body as AuthResendVerificationResponseBody;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Email already registered');
      });
    });
  });
});
