import { Op } from '@sequelize/core';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  GetJobs200Response,
  GetJobsExpandEnum,
  GetJobsSortDirectionEnum,
  GetJobsWorkStatusEnum,
} from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { JobModel } from '../models/models/Jobs';

type GetJobsQuery = {
  scheduled_start_min?: string;
  scheduled_start_max?: string;
  scheduled_end_min?: string;
  scheduled_end_max?: string;
  employee_ids?: Array<string>;
  customer_id?: string;
  page?: string;
  franchisee_ids?: Array<string>;
  work_status?: Array<GetJobsWorkStatusEnum>;
  page_size?: number;
  sort_direction?: GetJobsSortDirectionEnum;
  location_ids?: Array<string>;
  expand?: Array<GetJobsExpandEnum>;
};

export async function getJobsView(
  req: Request<unknown, unknown, unknown, GetJobsQuery>,
  res: Response<GetJobs200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getJobs',
  });

  try {
    log.info('Fetching jobs');
    const { rows, count } = await JobModel.findAndCountAll({
      where: {
        ...(req.query.customer_id
          ? {
              customer_id: req.query.customer_id,
            }
          : {}),
        ...(req.query.scheduled_start_min && req.query.scheduled_start_max
          ? {
              scheduled_start: {
                [Op.between]: [req.query.scheduled_start_min, req.query.scheduled_start_max],
              },
            }
          : {}),
        ...(req.query.scheduled_end_min && req.query.scheduled_end_max
          ? {
              scheduled_end: {
                [Op.between]: [req.query.scheduled_end_min, req.query.scheduled_end_max],
              },
            }
          : {}),
        ...(req.query.employee_ids
          ? {
              employee_id: {
                [Op.in]: req.query.employee_ids,
              },
            }
          : {}),
        ...(req.query.franchisee_ids
          ? {
              franchisee_id: {
                [Op.in]: req.query.franchisee_ids,
              },
            }
          : {}),
        ...(req.query.work_status
          ? {
              work_status: {
                [Op.in]: req.query.work_status,
              },
            }
          : {}),
      },
      limit: req.query.page_size ?? 10,
      offset: Number(req.query.page ?? 1) * (req.query.page_size ?? 10),
      // sort by
      order: [['created_at', req.query.sort_direction ?? 'ASC']],
    });

    res.status(200).json({
      page: Number(req.query.page ?? 1),
      page_size: req.query.page_size ?? 10,
      jobs: rows.map((job) => job.toJSON()),
      total_items: count,
      total_pages: Math.ceil(count / (req.query.page_size ?? 10)),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
