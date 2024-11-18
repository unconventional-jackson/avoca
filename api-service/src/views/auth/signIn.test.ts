import { ErrorResponse, SignIn200Response } from '@unconventional-jackson/avoca-internal-api';
import { hash } from 'bcrypt';
import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { getUserId, UserModel } from '../../models/models/Users';
import * as SendSendGridEmail from '../../services/sendSendGridEmail';

describe('views/Auth/signIn', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });
  beforeEach(() => {
    jest.spyOn(SendSendGridEmail, 'sendSendGridEmail').mockResolvedValue();
  });
  describe('success cases', () => {
    describe('when an admin signs in with valid credentials', () => {
      it('should return a success message', async () => {
        // Sign up the user first
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        // Mark the user's email as verified before signing in
        await UserModel.update(
          { authEmailVerified: true },
          { where: { email: 'test@example.com' } }
        );

        // Now attempt sign-in
        const response = await request(app).post('/auth/signin').send({
          email: 'test@example.com',
          password: 'password123',
        });

        const body = response.body as SignIn200Response;
        expect(response.status).toBe(200);
        expect(body.message).toBe('Sign-in successful');
      });
    });
  });

  describe('failure cases', () => {
    describe('when the email is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/signin').send({
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing email in the body.');
      });
    });

    describe('when the password is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/signin').send({
          email: 'test@example.com',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing password in the body.');
      });
    });

    describe('when the admin is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/signin').send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(404);
        expect(body.error).toBe('Admin not found');
      });
    });

    describe('when the admin does not have a password hash', () => {
      it('throws an error', async () => {
        // Create a user without a password hash
        await UserModel.create({
          userId: getUserId(),
          email: 'test_no_hash@example.com',
          authPasswordHash: null,
          authEmailVerified: true,
        });

        const response = await request(app).post('/auth/signin').send({
          email: 'test_no_hash@example.com',
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(500);
        expect(body.error).toBe('Admin does not have a password hash yet');
      });
    });

    describe('when the email is not verified', () => {
      it('throws an error', async () => {
        // Create a user with an unverified email
        await UserModel.create({
          userId: getUserId(),
          email: 'test_unverified@example.com',
          authPasswordHash: 'hashed_password',
          authEmailVerified: false, // Email is not verified
        });

        const response = await request(app).post('/auth/signin').send({
          email: 'test_unverified@example.com',
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(401);
        expect(body.error).toBe('Email not verified');
      });
    });
    describe('when the password is invalid', () => {
      it('throws an error', async () => {
        // Create a user with a correct password hash
        await UserModel.create({
          userId: getUserId(),
          email: 'test_wrong_password@example.com',
          authPasswordHash: await hash('correct_password', 10),
          authEmailVerified: true,
        });

        const response = await request(app).post('/auth/signin').send({
          email: 'test_wrong_password@example.com',
          password: 'wrong_password', // Invalid password
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(401);
        expect(body.error).toBe('Invalid credentials');
      });
    });
  });
});