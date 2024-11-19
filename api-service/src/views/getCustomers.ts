import { Op } from '@sequelize/core';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  GetV1Customers200Response,
  GetV1CustomersExpandEnum,
  GetV1CustomersSortByEnum,
  GetV1CustomersSortDirectionEnum,
} from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerModel } from '../models/models/Customers';

type GetCustomersQuery = {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: GetV1CustomersSortByEnum;
  sortDirection?: GetV1CustomersSortDirectionEnum;
  locationIds?: Array<string>;
  expand?: Array<GetV1CustomersExpandEnum>;
};

export async function getCustomersView(
  req: Request<unknown, unknown, unknown, GetCustomersQuery>,
  res: Response<GetV1Customers200Response | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getCustomer',
  });

  try {
    log.info('Fetching customers');
    const { rows, count } = await CustomerModel.findAndCountAll({
      where: {
        ...(req.query.q
          ? {
              [Op.or]: [
                {
                  first_name: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
                {
                  last_name: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
                {
                  email: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
                {
                  mobile_number: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
                {
                  home_number: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
                {
                  work_number: {
                    [Op.iLike]: `%${req.query.q}%`,
                  },
                },
              ],
            }
          : {}),
      },
      limit: req.query.pageSize ?? 10,
      offset: (req.query.page ?? 1 - 1) * (req.query.pageSize ?? 10),
      // sort by
      order: [[req.query.sortBy ?? 'created_at', req.query.sortDirection ?? 'ASC']],
    });

    res.status(200).json({
      page: req.query.page ?? 1,
      page_size: req.query.pageSize ?? 10,
      customers: rows.map((customer) => customer.toJSON()),
      total_items: count,
      total_pages: Math.ceil(count / (req.query.pageSize ?? 10)),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
