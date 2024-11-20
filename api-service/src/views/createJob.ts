import { Op } from '@sequelize/core';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Job, JobCreate } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { AddressId } from '../models/models/Addresses';
import { CustomerId } from '../models/models/Customers';
import { getJobId, JobModel } from '../models/models/Jobs';

export async function createJobView(
  req: Request<unknown, unknown, JobCreate>,
  res: Response<Job | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/createJob',
  });

  try {
    if (!req.body.customer_id) {
      res.status(400).json({ error: 'customer_id is required in the body.' });
      return;
    }

    if (!req.body.address_id) {
      res.status(400).json({
        error: 'address_id is required in the body.',
      });
      return;
    }

    if (!req.body.schedule?.scheduled_start) {
      res.status(400).json({
        error:
          'schedule.scheduled_start is not required by Avoca but is necessary for this project',
      });
      return;
    }
    if (!req.body.schedule?.scheduled_end) {
      res.status(400).json({
        error: 'schedule.scheduled_end is not required by Avoca but is necessary for this project',
      });
      return;
    }

    const existingJobsThatOverlap = await JobModel.count({
      where: {
        [Op.or]: [
          {
            'schedule.scheduled_start': {
              [Op.lte]: new Date(req.body.schedule.scheduled_end),
            },
            'schedule.scheduled_end': {
              [Op.gte]: new Date(req.body.schedule.scheduled_start),
            },
          },
          {
            'schedule.scheduled_start': {
              [Op.gte]: new Date(req.body.schedule.scheduled_start),
            },
            'schedule.scheduled_end': {
              [Op.lte]: new Date(req.body.schedule.scheduled_end),
            },
          },
        ],
      },
    });
    if (existingJobsThatOverlap > 0) {
      res.status(400).json({
        error: 'Job overlaps with existing job',
      });
      return;
    }

    const createdJob = await JobModel.create({
      ...req.body,
      address_id: req.body.address_id as AddressId,
      customer_id: req.body.customer_id as CustomerId,
      invoice_number: String(req.body.invoice_number),
      notes: req.body.notes?.split('\n').map((content) => ({
        id: getJobId(),
        content,
      })),
      id: getJobId(),
    });

    res.status(201).json({
      ...createdJob.toJSON(),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
