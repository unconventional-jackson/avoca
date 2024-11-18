import {
  AuthSignInRequestBody,
  AuthUser,
  ErrorResponse,
  SignIn200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import ms from 'ms';

import { UserModel } from '../../models/models/Users';
import { AccessTokenPayload, RefreshTokenPayload } from '../../utils/auth';
import {
  ACCESS_TOKEN_TIMEOUT,
  REFRESH_TOKEN_TIMEOUT,
  TOTP_VERIFY_TIMEOUT,
} from '../../utils/constants';
import { getConfig } from '../../utils/secrets';

export async function signInView(
  req: Request<unknown, unknown, AuthSignInRequestBody>,
  res: Response<SignIn200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/signIn',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ error: 'Missing email in the body.' });
      return;
    }
    const email = req.body.email;

    if (!req.body.password) {
      res.status(400).json({ error: 'Missing password in the body.' });
      return;
    }
    const password = req.body.password;

    const user = await UserModel.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if the email is verified before proceeding with password validation
    if (!user.authEmailVerified) {
      res.status(401).json({ error: 'Email not verified' });
      return;
    }

    if (!user.authPasswordHash) {
      res.status(500).json({ error: 'User does not have a password hash yet' });
      return;
    }

    let isValidPassword = false;
    try {
      isValidPassword = await compare(password, user.authPasswordHash);
    } catch (error) {
      log.error(error);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (
      user.authTotpVerifiedAt &&
      DateTime.fromJSDate(user.authTotpVerifiedAt).diffNow().toMillis() > ms(TOTP_VERIFY_TIMEOUT)
    ) {
      const unchallengedAuthUser: AuthUser = {
        userId: user.userId,
        email: user.email,
        authEmailVerified: user.authEmailVerified,
        authTotpVerifiedAt: user.authTotpVerifiedAt?.toISOString() || null,
        authTotpEnabled: user.authTotpEnabled,
      };
      res.status(200).json({ message: 'TOTP verification expired', user: unchallengedAuthUser });
      return;
    }

    // Generate session JWT here
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
      userId: user.userId,
      email: user.email,
      accessToken,
      refreshToken,
      authEmailVerified: user.authEmailVerified,
      authTotpVerifiedAt: user.authTotpVerifiedAt?.toISOString() || null,
      authTotpEnabled: user.authTotpEnabled,
    };

    res.status(200).json({
      message: 'Sign-in successful',
      user: authUser,
    });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
