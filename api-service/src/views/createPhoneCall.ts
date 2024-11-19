import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  CreatePhoneCallRequest,
  ErrorResponse,
  PhoneCall,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerId } from '../models/models/Customers';
import { JobId } from '../models/models/Jobs';
import { getPhoneCallId, PhoneCallModel } from '../models/models/PhoneCalls';

export async function createPhoneCallView(
  req: Request<unknown, unknown, CreatePhoneCallRequest>,
  res: Response<PhoneCall | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/createPhoneCall',
  });

  try {
    if (!req.body.start_date_time) {
      res.status(400).json({ error: 'Missing start_date_time in the body.' });
      return;
    }
    const startDateTime = new Date(req.body.start_date_time);

    if (!req.body.phone_number) {
      res.status(400).json({ error: 'Missing phone_number in the body.' });
      return;
    }
    const phoneNumber = req.body.phone_number;

    const { end_date_time: endDateTime, ...rest } = req.body;

    const createdPhoneCall = await PhoneCallModel.create({
      ...rest,
      phone_call_id: getPhoneCallId(),
      start_date_time: startDateTime,
      end_date_time: endDateTime ? new Date(endDateTime) : null,
      phone_number: phoneNumber,
      customer_id: req.body.customer_id ? (req.body.customer_id as CustomerId) : null,
      job_id: req.body.job_id ? (req.body.job_id as JobId) : null,
      transcript: req.body.transcript ?? null,
    });

    const phoneCall = createdPhoneCall.toJSON();
    res.status(201).json({
      ...phoneCall,
      start_date_time: phoneCall.start_date_time?.toISOString(),
      end_date_time: phoneCall.end_date_time?.toISOString(),
    } as PhoneCall);
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
