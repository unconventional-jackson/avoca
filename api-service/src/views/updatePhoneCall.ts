import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  ErrorResponse,
  PhoneCall,
  UpdatePhoneCallRequestBody,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerId } from '../models/models/Customers';
import { EmployeeId } from '../models/models/Employees';
import { JobId } from '../models/models/Jobs';
import { PhoneCall as InternalPhoneCall, PhoneCallModel } from '../models/models/PhoneCalls';

type UpdatePhoneCallParams = {
  phone_call_id: string;
};

export async function updatePhoneCallView(
  req: Request<UpdatePhoneCallParams, unknown, UpdatePhoneCallRequestBody>,
  res: Response<PhoneCall | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/updatePhoneCall',
  });

  try {
    if (!req.params.phone_call_id) {
      res.status(400).json({ error: 'Missing phone_call_id in the params.' });
      return;
    }

    const input: Partial<InternalPhoneCall> = {};

    if (req.body.customer_id) {
      log.info('Assigning Customer to Phone Call', {
        customer_id: req.body.customer_id,
        phone_call_id: req.params.phone_call_id,
      });
      input.customer_id = req.body.customer_id as CustomerId;
    }
    if (req.body.job_id) {
      log.info('Assigning Job to Phone Call', {
        job_id: req.body.job_id,
        phone_call_id: req.params.phone_call_id,
      });
      input.job_id = req.body.job_id as JobId;
    }
    if (req.body.transcript) {
      log.info('Updating transcript of Phone Call', {
        phone_call_id: req.params.phone_call_id,
      });
      input.transcript = req.body.transcript;
    }
    if (req.body.end_date_time) {
      log.info('Updating end of Phone Call', {
        phone_call_id: req.params.phone_call_id,
        end_date_time: req.body.end_date_time,
      });
      input.end_date_time = new Date(req.body.end_date_time);
    }
    if (req.body.employee_id) {
      log.info('Assigning Employee to Phone Call', {
        employee_id: req.body.employee_id,
        phone_call_id: req.params.phone_call_id,
      });
      input.employee_id = req.body.employee_id as EmployeeId;
    }
    const [updated, updatedPhoneCalls] = await PhoneCallModel.update(
      {
        ...input,
      },
      {
        where: {
          phone_call_id: req.params.phone_call_id,
        },
        returning: true,
      }
    );
    if (updated === 0) {
      res.status(404).json({ error: 'Phone call not found' });
      return;
    }

    if (!updatedPhoneCalls) {
      res.status(500).json({ error: 'Phone call not updated' });
      return;
    }

    if (updatedPhoneCalls.length !== 1) {
      res.status(500).json({ error: 'Phone call not updated' });
      return;
    }

    const updatedPhoneCall = updatedPhoneCalls[0];

    const phoneCall = updatedPhoneCall.toJSON();
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
