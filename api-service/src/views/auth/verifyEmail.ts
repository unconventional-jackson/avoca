import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthUser,
  AuthVerifyEmailRequestBody,
  ErrorResponse,
  VerifyEmail200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { UserModel } from '../../models/models/Users';

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
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.authEmailVerificationToken) {
      res.status(400).json({ error: 'No verification token found for user' });
      return;
    }

    const isValidToken = speakeasy.totp.verify({
      secret: user.authEmailVerificationToken,
      encoding: 'ascii',
      token,
      digits: 6,
      window: 1,
    });

    if (!isValidToken) {
      res.status(400).json({ error: 'Invalid or expired verification code' });
      return;
    }

    await user.update({
      authEmailVerified: true,
      authStatus: 'active',
      authEmailVerificationToken: null,
    });

    const authUser: AuthUser = {
      userId: user.userId,
      email: user.email,
      authEmailVerified: user.authEmailVerified,
      authTotpEnabled: user.authTotpEnabled,
      authTotpVerifiedAt: user?.authTotpVerifiedAt?.toISOString() || null,
    };

    res.status(200).json({ message: 'Email verified successfully.', user: authUser });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
