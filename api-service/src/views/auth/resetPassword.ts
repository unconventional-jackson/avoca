import {
  AuthResetPasswordBody,
  ErrorResponse,
  ResetPassword200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';

import { UserModel } from '../../models/models/Users';

export async function resetPasswordView(
  req: Request<unknown, unknown, AuthResetPasswordBody>,
  res: Response<ResetPassword200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/resetPassword',
  });

  try {
    if (!req.body.newPassword) {
      res.status(400).json({ message: 'Missing newPassword in the body.' });
      return;
    }
    const newPassword = req.body.newPassword;

    if (!req.body.token) {
      res.status(400).json({ message: 'Missing token in the body.' });
      return;
    }
    const token = req.body.token;

    const user = await UserModel.findOne({ where: { email: req.body.email } });

    // else if (res.locals.userId) {
    //   user = await UserModel.findByPk(res.locals.userId);
    // }
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.authResetPasswordToken) {
      res.status(400).json({ error: 'Token not found' });
      return;
    }

    if (token !== user.authResetPasswordToken) {
      res.status(400).json({ error: 'Invalid token' });
      return;
    }

    /**
     * Hash the new password and update the user
     */
    const authPasswordHash = await hash(newPassword, 10);
    await user.update({
      authPasswordHash,
      authResetPasswordToken: null, // Clear the token
    });

    res.status(200).json({ message: 'Password updated' });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
