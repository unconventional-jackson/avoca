import { ErrorResponse, SignUp201Response } from '@unconventional-jackson/avoca-internal-api';
import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { EmployeeModel } from '../../models/models/Employees';
import * as SendGrid from '../../services/sendSendGridEmail';

describe('views/Auth/signUp', () => {
  let app: Express;
  beforeAll(async () => {
    app = await main(true);
  });
  describe('success cases', () => {
    describe('when a new user signs up', () => {
      it('should create a new user and send a verification email', async () => {
        const userModelFindOneSpy = jest.spyOn(EmployeeModel, 'findOne');
        const userModelCreateSpy = jest.spyOn(EmployeeModel, 'create');

        const sendSendGridEmailSpy = jest.spyOn(SendGrid, 'sendSendGridEmail').mockResolvedValue();

        const response = await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(response.status).toBe(201);
        const body = response.body as SignUp201Response;
        expect(body.message).toBe('User created. Verify your email.');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(userModelFindOneSpy).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(userModelCreateSpy).toHaveBeenCalled();
        expect(sendSendGridEmailSpy).toHaveBeenCalledWith(
          {
            to: ['test@example.com'],
            subject: 'Verify Your Email',
            body: expect.stringContaining('Your verification code is: ') as string,
          },
          expect.anything()
        );
      });
    });
  });
  describe('failure cases', () => {
    describe('when the email is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/signup').send({
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing email in the body.');
      });
    });

    describe('when the password is missing', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/signup').send({
          email: 'test@example.com',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Missing password in the body.');
      });
    });

    describe('when the email is already registered', () => {
      it('throws an error', async () => {
        await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });
        const response = await request(app).post('/auth/signup').send({
          email: 'test@example.com',
          password: 'password123',
        });

        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Email already registered');
      });
    });
  });
});
