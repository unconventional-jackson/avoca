import { Op } from '@sequelize/core';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  ErrorResponse,
  GetPhoneCallsResponse,
  GetPhoneCallsSortByEnum,
  GetPhoneCallsSortDirectionEnum,
  PhoneCall,
} from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { PhoneCallModel } from '../models/models/PhoneCalls';

type GetPhoneCallsQuery = {
  page?: number;
  page_size?: number;
  sort_by?: GetPhoneCallsSortByEnum;
  sort_direction?: GetPhoneCallsSortDirectionEnum;
};

export async function getPhoneCallsView(
  req: Request<unknown, unknown, unknown, GetPhoneCallsQuery>,
  res: Response<GetPhoneCallsResponse | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getPhoneCalls',
  });

  try {
    const pageSize = req.query.page_size ? Number(req.query.page_size) : 10;
    const page = (req.query.page ? Number(req.query.page) : 1) ?? 1;
    const { rows, count } = await PhoneCallModel.findAndCountAll({
      where: {
        [Op.or]: [
          {
            employee_id: res.locals.employee_id,
          },
          {
            [Op.and]: {
              end_date_time: null,
              employee_id: null,
            },
          },
        ],
      },
      limit: pageSize,
      offset: page * pageSize,
      // sort by
      order: [[req.query.sort_by ?? 'created_at', req.query.sort_direction ?? 'ASC']],
    });

    res.status(200).json({
      page: page,
      page_size: pageSize,
      phone_calls: rows.map((pC) => {
        const phoneCall = pC.toJSON();
        return {
          ...phoneCall,
          start_date_time: phoneCall.start_date_time?.toISOString(),
          end_date_time: phoneCall.end_date_time?.toISOString(),
        } as PhoneCall;
      }),
      total_items: count,
      total_pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
