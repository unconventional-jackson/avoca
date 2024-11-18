import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  AuthTOTPSetupRequestBody,
  ErrorResponse,
  TotpSetup200Response,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';

import { UserModel } from '../../models/models/Users';
import { TOTP_DOMAIN } from '../../utils/constants';

export type AuthTOTPSetupResponseBody = {
  otpauth_url?: string;
  error?: unknown;
};

export async function totpSetupView(
  req: Request<unknown, unknown, AuthTOTPSetupRequestBody>,
  res: Response<TotpSetup200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/Auth/totpSetup',
  });

  try {
    if (!req.body.email) {
      res.status(400).json({ error: 'Missing email in the body.' });
      return;
    }
    const email = req.body.email;

    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    let authTotpSecret = user.authTotpSecret;
    if (!authTotpSecret) {
      log.info('User does not have TOTP secret set up, generating one', {
        userId: user.userId,
      });
      const secret = speakeasy.generateSecret({ length: 20, name: TOTP_DOMAIN });
      authTotpSecret = secret.ascii;
      user.authTotpSecret = authTotpSecret;
      await user.save();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const otpauth_url = speakeasy.otpauthURL({
      secret: authTotpSecret,
      label: TOTP_DOMAIN,
      issuer: TOTP_DOMAIN,
    });

    res.status(200).json({ otpauth_url });
    return;
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
