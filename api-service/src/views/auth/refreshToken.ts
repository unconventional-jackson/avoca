import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthRefreshTokenRequestBody,
  ErrorResponse,
  RefreshToken200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { EmployeeModel } from '../../models/models/Employees';
import { AccessTokenPayload, RefreshTokenPayload } from '../../utils/auth';
import { ACCESS_TOKEN_TIMEOUT } from '../../utils/constants';
import { getConfig } from '../../utils/secrets';

export async function refreshTokenView(
  req: Request<unknown, unknown, AuthRefreshTokenRequestBody>,
  res: Response<RefreshToken200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/refreshToken',
  });

  try {
    if (!req.body.refresh_token) {
      res.status(400).json({ error: 'Missing refresh_token in the body' });
      return;
    }
    const refreshToken = req.body.refresh_token;

    const config = await getConfig();

    const decoded = jwt.verify(refreshToken, config.ACCESS_TOKEN_SECRET);
    if (typeof decoded !== 'object') {
      throw new Error('Invalid refresh token');
    }

    const typeSafeDecoded = decoded as RefreshTokenPayload;
    const employeeId = typeSafeDecoded.employee_id;
    const user = await EmployeeModel.findByPk(employeeId);

    if (
      !user?.auth_refresh_token ||
      user?.auth_refresh_token !== refreshToken ||
      !user?.email ||
      !user?.employee_id
    ) {
      throw new Error('Missing or invalid properties for token');
    }
    log.info('User is refreshing their token', {
      employee_id: user.employee_id,
    });
    const accessTokenPayload: AccessTokenPayload = {
      email: user.email,
      employee_id: user.employee_id,
    };
    const accessToken = jwt.sign(accessTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMEOUT,
    });

    res.status(200).json({
      access_token: accessToken,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
