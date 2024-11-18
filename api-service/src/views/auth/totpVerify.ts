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

import { UserModel } from '../../models/models/Users';
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

    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!user.authTotpSecret) {
      res.status(404).json({ error: 'TOTP not set up' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.authTotpSecret,
      encoding: 'ascii',
      token,
    });

    if (!verified) {
      res.status(400).json({ error: 'Invalid TOTP token' });
      return;
    }

    if (!user?.authTotpEnabled) {
      log.info('Enabling TOTP for user', { userId: user.userId });
      await user.update({
        authTotpEnabled: true,
      });
    }

    await user.update({
      authTotpVerifiedAt: new Date(),
    });

    const config = await getConfig();
    const accessTokenPayload: AccessTokenPayload = {
      email: user.email,
      userId: user.userId,
    };
    const accessToken = jwt.sign(accessTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMEOUT,
    });

    const refreshTokenPayload: RefreshTokenPayload = {
      email: user.email,
      userId: user.userId,
    };
    const refreshToken = jwt.sign(refreshTokenPayload, config.ACCESS_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_TIMEOUT,
    });

    const authUser: AuthUser = {
      email: user.email,
      userId: user.userId,
      accessToken,
      refreshToken,
      authEmailVerified: user.authEmailVerified,
      authTotpVerifiedAt: user.authTotpVerifiedAt?.toISOString() || null,
      authTotpEnabled: user.authTotpEnabled,
    };

    res.status(200).json({
      message: 'TOTP verified successfully',
      user: authUser,
    });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
