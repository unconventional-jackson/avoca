import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthRefreshTokenRequestBody,
  ErrorResponse,
  RefreshToken200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { UserModel } from '../../models/models/Users';
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
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refresh token in the body' });
      return;
    }

    const config = await getConfig();

    const decoded = jwt.verify(refreshToken, config.ACCESS_TOKEN_SECRET);
    if (typeof decoded !== 'object') {
      throw new Error('Invalid refresh token');
    }

    const typeSafeDecoded = decoded as RefreshTokenPayload;
    const userId = typeSafeDecoded.userId;
    const user = await UserModel.findByPk(userId);

    if (
      !user?.authRefreshToken ||
      user?.authRefreshToken !== refreshToken ||
      !user?.email ||
      !user?.userId
    ) {
      throw new Error('Missing or invalid properties for token');
    }
    log.info('User is refreshing their token', {
      userId: user.userId,
    });
    const accessTokenPayload: AccessTokenPayload = {
      email: user.email,
      userId: user.userId,
    };
    const accessToken = jwt.sign(accessTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMEOUT,
    });

    res.status(200).json({
      accessToken,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
