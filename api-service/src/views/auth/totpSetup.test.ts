import { Express } from 'express';
import request from 'supertest';

import { main } from '../../app';
import { getEmployeeId } from '../../models/models/Employees';
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
        const email = getEmployeeId();
        await request(app).post('/auth/signup').send({
          email,
          password: 'password123',
        });

        // Extract employee_id from the signup response
        // const employee = await EmployeeModel.findOne({ where: { email } });

        // Call the TOTP setup endpoint, setting the employee_id in the headers
        const response = await request(app).post('/auth/totp/setup').send({
          email,
        });

        const body = response.body as AuthTOTPSetupResponseBody;
        expect(response.status).toBe(200);
        expect(body.otpauth_url).toContain('otpauth://totp/');
      });
    });
  });

  describe('failure cases', () => {
    describe('when the user is not found', () => {
      it('throws an error', async () => {
        const response = await request(app).post('/auth/totp/setup').send({
          email: getEmployeeId(),
        });

        const body = response.body as AuthTOTPSetupResponseBody;
        expect(response.status).toBe(404);
        expect(body.error).toBe('User not found');
      });
    });
  });
});
