import { NodeLogger } from '@unconventional-code/observability-sdk';

import { ExtraModelArgs } from '../models/models/types';
import { getSendGridClient } from '../utils/clients';
import { getConfig } from '../utils/secrets';

type SendSESEmailArgs = {
  to: string[];
  subject: string;
  body: string;
};

export async function sendSendGridEmail(
  { to, subject, body }: SendSESEmailArgs,
  misc: ExtraModelArgs
) {
  const log = new NodeLogger({
    correlation: misc?.correlation,
    name: 'models/SendGrid/sendSendGridEmail',
  });
  try {
    log.info('Sending email with SendGrid');
    const config = await getConfig();
    const sendGridClient = await getSendGridClient();
    await sendGridClient.send({
      to,
      from: config.SENDGRID_SOURCE_EMAIL_ADDRESS,
      subject,
      text: body,
    });
    log.info('Email sent with SendGrid');
  } catch (error) {
    log.error(error, {
      detail: 'Failed to send email with SendGrid',
    });
    // Not going to throw right now
  }
}
