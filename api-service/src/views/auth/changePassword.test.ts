/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ErrorResponse, SignIn200Response } from '@unconventional-jackson/avoca-internal-api';
import { compare } from 'bcrypt';
import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { getUserId, UserModel } from '../../models/models/Users';
import { AuthChangePasswordResponseBody } from './changePassword';

describe('views/Auth/changePassword', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });

  describe('success cases', () => {
    describe('when the password change is successful', () => {
      it('updates the password and returns success', async () => {
        // Step 1: Sign up a user
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'old_password',
        });

        // Simulate email verification
        await UserModel.update(
          { authEmailVerified: true },
          { where: { email: 'test@example.com' } }
        );

        // Step 2: Sign in the user (to simulate a session)
        const signInResponse = await request(app).post('/auth/signin').send({
          email: 'test@example.com',
          password: 'old_password',
        });

        const email = (signInResponse.body as SignIn200Response)?.user?.email; // Extract email
        expect(email).toBeDefined(); // Ensure email is defined
        expect(signInResponse.status).toBe(200);

        // Step 3: Change the password using the email
        const response = await request(app)
          .post('/auth/change-password')
          .send({
            currentPassword: 'old_password',
            newPassword: 'newPassword123',
          })
          .set('email', email!); // Use email for subsequent requests

        const body = response.body as AuthChangePasswordResponseBody;
        expect(response.status).toBe(200);
        expect(body.message).toBe('Password updated');

        // Step 4: Verify the password was updated
        const updatedAdmin = await UserModel.findOne({ where: { email: 'test@example.com' } });
        const isPasswordUpdated =
          !!updatedAdmin?.authPasswordHash &&
          compare('newPassword123', updatedAdmin?.authPasswordHash);
        expect(isPasswordUpdated).toBe(true);
      });
    });
  });

  describe('failure cases', () => {
    describe('when the current password is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/change-password').send({
          newPassword: 'newPassword123',
        });

        const body = response.body as AuthChangePasswordResponseBody;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No currentPassword value.');
      });
    });

    describe('when the new password is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/change-password').send({
          currentPassword: 'old_password',
        });

        const body = response.body as AuthChangePasswordResponseBody;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No newPassword value.');
      });
    });

    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const email = 'nonexistent@example.com'; // Use a non-existent email
        const response = await request(app)
          .post('/auth/change-password')
          .send({
            currentPassword: 'old_password',
            newPassword: 'newPassword123',
          })
          .set('email', email);

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('User not found');
      });
    });
    describe('when the user has no password set', () => {
      it('throws an error', async () => {
        // Create a user without a password
        const user = await UserModel.create({
          userId: getUserId(),
          email: 'test_no_password@example.com',
          authEmailVerified: false,
          authPasswordHash: null, // No password set
        });

        const response = await request(app)
          .post('/auth/change-password')
          .send({
            currentPassword: 'old_password',
            newPassword: 'newPassword123',
          })
          .set('email', user.email);

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Admin has no password');
      });
    });

    describe('when the current password does not match', () => {
      it('throws an error', async () => {
        // Step 1: Sign up a user
        const email = 'test@example.com';
        await request(app).post('/auth/signup').send({
          email,
          password: 'correct_password',
        });

        // Simulate email verification
        await UserModel.update({ authEmailVerified: true }, { where: { email } });

        // Step 3: Try changing the password with an incorrect current password
        const response = await request(app)
          .post('/auth/change-password')
          .send({
            currentPassword: 'wrong_password',
            newPassword: 'newPassword123',
          })
          .set('email', email);

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Password does not match');
      });
    });
  });
});
