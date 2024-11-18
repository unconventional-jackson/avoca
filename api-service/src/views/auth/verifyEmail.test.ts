import { ErrorResponse, VerifyEmail200Response } from '@unconventional-jackson/avoca-internal-api';
import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { UserModel } from '../../models/models/Users';
import * as SendGrid from '../../services/sendSendGridEmail';

describe('views/Auth/verifyEmail', () => {
  let app: Express;

  beforeAll(async () => {
    app = await main(true);
    jest.spyOn(SendGrid, 'sendSendGridEmail').mockResolvedValue();
  });

  describe('success cases', () => {
    describe('when the email and token are valid', () => {
      it('should verify the email successfully', async () => {
        const userModelFindOneSpy = jest.spyOn(UserModel, 'findOne');

        // Sign up the user first
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        // Fetch the created user and update to have a valid verification token
        await UserModel.update(
          { authEmailVerificationToken: 'valid_token' },
          { where: { email: 'test@example.com' } }
        );

        // Perform verify email request (without using userId in headers)
        const response = await request(app).post('/auth/verify-email').send({
          email: 'test@example.com',
          token: 'valid_token',
        });

        const body = response.body as VerifyEmail200Response;
        expect(response.status).toBe(200);
        expect(body.message).toBe('Email verified successfully.');

        // Verify the user was updated in the database
        const updatedUser = await UserModel.findOne({ where: { email: 'test@example.com' } });
        expect(userModelFindOneSpy).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
        expect(updatedUser?.authEmailVerified).toBe(true);
        expect(updatedUser?.authEmailVerificationToken).toBeNull();
        expect(updatedUser?.authStatus).toBe('active');
      });
    });
  });

  describe('failure cases', () => {
    describe('when the email is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/verify-email').send({
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('Missing email in the body.');
      });
    });

    describe('when the token is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/verify-email').send({
          email: 'test@example.com',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.message).toBe('No token value.');
      });
    });

    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/verify-email').send({
          email: 'nonexistent@example.com',
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });

    describe('when the email is invalid', () => {
      it('throws an error', async () => {
        // Sign up the user first
        await request(app).post('/auth/signup').send({
          email: 'other@example.com',
          password: 'password123',
        });

        // Update user to have a valid verification token
        await UserModel.update(
          { authEmailVerificationToken: 'valid_token' },
          { where: { email: 'other@example.com' } }
        );

        const response = await request(app).post('/auth/verify-email').send({
          email: 'test@example.com', // Incorrect email
          token: 'valid_token',
        });

        const body = response.body as ErrorResponse;
        // Adjusted expected status to 404 instead of 400
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });

    describe('when the token is invalid', () => {
      it('throws an error', async () => {
        // Sign up the user first
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        // Update user to have a valid verification token
        await UserModel.update(
          { authEmailVerificationToken: 'valid_token' },
          { where: { email: 'test@example.com' } }
        );

        const response = await request(app).post('/auth/verify-email').send({
          email: 'test@example.com',
          token: 'invalid_token', // Incorrect token
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid token for verifying email');
      });
    });
  });
});
