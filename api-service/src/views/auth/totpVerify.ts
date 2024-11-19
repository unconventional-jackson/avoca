import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthTOTPVerifyRequestBody,
  AuthUser,
  ErrorResponse,
  TotpVerify200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';

import { EmployeeModel } from '../../models/models/Employees';
import { AccessTokenPayload, RefreshTokenPayload } from '../../utils/auth';
import { ACCESS_TOKEN_TIMEOUT, REFRESH_TOKEN_TIMEOUT } from '../../utils/constants';
import { getConfig } from '../../utils/secrets';

export async function totpVerifyView(
  req: Request<unknown, unknown, AuthTOTPVerifyRequestBody>,
  res: Response<TotpVerify200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/totpVerify',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ message: 'Missing email in the body.' });
      return;
    }
    if (!req.body.token) {
      res.status(400).json({ message: 'Missing token in the body.' });
      return;
    }

    const { email, token } = req.body;

    const employee = await EmployeeModel.findOne({ where: { email } });

    if (!employee) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!employee.auth_totp_secret) {
      res.status(400).json({ error: 'TOTP not set up' });
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

    if (!employee?.auth_totp_enabled) {
      log.info('Enabling TOTP for employee', { employee_id: employee.employee_id });
      await employee.update({
        auth_totp_enabled: true,
      });
    }

    await employee.update({
      auth_totp_verified_at: new Date(),
    });

    const config = await getConfig();
    const accessTokenPayload: AccessTokenPayload = {
      email: employee.email,
      employee_id: employee.employee_id,
    };
    const accessToken = jwt.sign(accessTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMEOUT,
    });

    const refreshTokenPayload: RefreshTokenPayload = {
      email: employee.email,
      employee_id: employee.employee_id,
    };
    const refreshToken = jwt.sign(refreshTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_TIMEOUT,
    });

    const authUser: AuthUser = {
      email: employee.email,
      employee_id: employee.employee_id,
      access_token: accessToken,
      refresh_token: refreshToken,
      auth_email_verified: employee.auth_email_verified,
      auth_totp_verified_at: employee.auth_totp_verified_at?.toISOString() || null,
      auth_totp_enabled: employee.auth_totp_enabled,
    };

    res.status(200).json({
      message: 'TOTP verified successfully',
      employee: authUser,
    });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
