import { AuthResendVerificationRequestBody } from '@unconventional-jackson/avoca-internal-api';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { UserModel } from '../../models/models/Users';
import { sendSendGridEmail } from '../../services/sendSendGridEmail';

export type AuthResendVerificationResponseBody = {
  message?: string;
  error?: unknown;
};

export async function resendVerificationView(
  req: Request<unknown, unknown, AuthResendVerificationRequestBody>,
  res: Response<AuthResendVerificationResponseBody>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/resendVerification',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ message: 'Missing email in the body.' });
      return;
    }
    const email = req.body.email;

    const user = await UserModel.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.authEmailVerified) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const verificationCode = speakeasy.totp({
      secret: user.authEmailVerificationToken ?? '',
      encoding: 'ascii',
      digits: 6,
    });

    await sendSendGridEmail(
      {
        to: [email],
        subject: 'Verify Your Email',
        body: `Your new verification code is: ${verificationCode}`,
      },
      {
        correlation: res.locals.correlation,
      }
    );
    res.status(201).json({ message: 'Verification email resent. Verify your email.' });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error });
  }
}
