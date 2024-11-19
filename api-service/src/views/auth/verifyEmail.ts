import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthUser,
  AuthVerifyEmailRequestBody,
  ErrorResponse,
  VerifyEmail200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { EmployeeModel } from '../../models/models/Employees';

export async function verifyEmailView(
  req: Request<unknown, unknown, AuthVerifyEmailRequestBody>,
  res: Response<VerifyEmail200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/verifyEmail',
  });

  try {
    const { email, token } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Missing email in the body.' });
      return;
    }
    if (!token) {
      res.status(400).json({ message: 'Missing token in the body.' });
      return;
    }
    const employee = await EmployeeModel.findOne({ where: { email } });
    if (!employee) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!employee.auth_totp_secret) {
      res.status(400).json({ error: 'No TOTP secret found for employee' });
      return;
    }

    const isValidToken = speakeasy.totp.verify({
      secret: employee.auth_totp_secret,
      encoding: 'ascii',
      token,
      digits: 6,
      window: 1,
    });

    if (!isValidToken) {
      res.status(400).json({ error: 'Invalid or expired verification code' });
      return;
    }

    await employee.update({
      auth_email_verified: true,
      auth_status: 'active',
    });

    const authUser: AuthUser = {
      employee_id: employee.employee_id,
      email: employee.email,
      auth_email_verified: employee.auth_email_verified,
      auth_totp_enabled: employee.auth_totp_enabled,
      auth_totp_verified_at: employee?.auth_totp_verified_at?.toISOString() || null,
    };

    res.status(200).json({ message: 'Email verified successfully.', employee: authUser });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
