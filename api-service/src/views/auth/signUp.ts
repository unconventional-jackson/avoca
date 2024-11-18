import {
  AuthSignUpRequestBody,
  ErrorResponse,
  SignUp201Response,
} from '@unconventional-jackson/avoca-internal-api';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { getUserId, UserModel } from '../../models/models/Users';
import { sendSendGridEmail } from '../../services/sendSendGridEmail';

export async function signUpView(
  req: Request<unknown, unknown, AuthSignUpRequestBody>,
  res: Response<SignUp201Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/signUp',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ message: 'Missing email in the body.' });
      return;
    }
    const email = req.body.email;

    if (!req.body.password) {
      res.status(400).json({ message: 'Missing password in the body.' });
      return;
    }
    const password = req.body.password;

    const maybeUser = await UserModel.findOne({
      where: {
        email,
      },
    });
    if (maybeUser) {
      res.status(400).json({ error: 'Email already registered for this user' });
      return;
    }

    const authPasswordHash = await hash(password, 10);

    const secret = speakeasy.generateSecret({ length: 20 });

    const authTotpSecret = secret.ascii;

    const user = await UserModel.create({
      userId: getUserId(),
      email,
      authPasswordHash,
      authEmailVerified: false,
      authEmailVerificationToken: authTotpSecret,
      authTotpSecret,
      authStatus: 'pendingVerification',
    });

    log.info('User created', { userId: user.userId });

    const verificationCode = speakeasy.totp({
      secret: authTotpSecret,
      encoding: 'ascii',
      digits: 6,
    });

    await sendSendGridEmail(
      {
        to: [email],
        subject: 'Verify Your Email',
        body: `Your verification code is: ${verificationCode}`,
      },
      {
        correlation: res.locals.correlation,
      }
    );
    res.status(201).json({ message: 'User created. Verify your email.' });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}