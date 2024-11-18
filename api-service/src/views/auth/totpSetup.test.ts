import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { UserId, UserModel } from '../../models/models/Users';
import { AuthTOTPSetupResponseBody } from './totpSetup';

describe('views/Auth/totpSetup', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });
  describe('success cases', () => {
    describe('when the user is found and TOTP is set up', () => {
      it('returns the otpauth_url for the user', async () => {
        // First, sign up a user
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        // Extract userId from the signup response
        const user = await UserModel.findOne({ where: { email: 'test@example.com' } });
        const userId = user?.userId as UserId;

        // Call the TOTP setup endpoint, setting the userId in the headers
        const response = await request(app)
          .post('/auth/totp/setup')
          .set('userId', userId) // Set the userId header to simulate an authenticated user
          .send();

        const body = response.body as AuthTOTPSetupResponseBody;
        expect(response.status).toBe(200);
        expect(body.otpauth_url).toContain('otpauth://totp/');

        // Verify that the user has the TOTP secret stored
        const updatedUser = await UserModel.findOne({ where: { email: 'test@example.com' } });
        expect(updatedUser?.authTotpSecret).not.toBeNull();
      });
    });
  });

  describe('failure cases', () => {
    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/totp/setup').send();

        const body = response.body as AuthTOTPSetupResponseBody;
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });
  });
});
