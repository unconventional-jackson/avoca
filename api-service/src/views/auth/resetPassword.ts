import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthResetPasswordBody,
  ErrorResponse,
  ResetPassword200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { EmployeeModel } from '../../models/models/Employees';

export async function resetPasswordView(
  req: Request<unknown, unknown, AuthResetPasswordBody>,
  res: Response<ResetPassword200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/resetPassword',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ error: 'Missing email in the body.' });
      return;
    }

    if (!req.body.new_password) {
      res.status(400).json({ error: 'Missing new_password in the body.' });
      return;
    }
    const newPassword = req.body.new_password;

    if (!req.body.token) {
      res.status(400).json({ error: 'Missing token in the body.' });
      return;
    }
    const token = req.body.token;

    const employee = await EmployeeModel.findOne({ where: { email: req.body.email } });

    // else if (res.locals.employee_id) {
    //   employee = await UserModel.findByPk(res.locals.employee_id);
    // }
    if (!employee) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!employee.auth_totp_secret) {
      res.status(404).json({ error: 'TOTP not set up' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: employee.auth_totp_secret,
      encoding: 'ascii',
      token,
    });

    if (!verified) {
      res.status(400).json({ error: 'Invalid TOTP token' });
      return;
    }

    /**
     * Hash the new password and update the employee
     */
    const authPasswordHash = await hash(newPassword, 10);
    await employee.update({
      auth_password_hash: authPasswordHash,
    });

    res.status(200).json({ message: 'Password updated' });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
