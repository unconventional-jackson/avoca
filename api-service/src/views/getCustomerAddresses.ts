import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  GetCustomerCustomerIdAddressesRequest,
  GetCustomerCustomerIdAddressesSortByEnum,
  GetCustomerCustomerIdAddressesSortDirectionEnum,
} from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { AddressModel } from '../models/models/Addresses';

type GetCustomerParams = {
  customer_id: string;
};

type GetCustomerAddressesQuery = {
  page?: number;
  page_size?: number;
  sort_by?: GetCustomerCustomerIdAddressesSortByEnum;
  sort_direction?: GetCustomerCustomerIdAddressesSortDirectionEnum;
};

export async function getCustomerAddressesView(
  req: Request<GetCustomerParams, unknown, unknown, GetCustomerAddressesQuery>,
  res: Response<GetCustomerCustomerIdAddressesRequest | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getCustomerAddresses',
  });

  try {
    const { rows, count } = await AddressModel.findAndCountAll({
      where: {
        customer_id: req.params.customer_id,
      },
      limit: req.query.page_size ?? 10,
      offset: (req.query.page ?? 1 - 1) * (req.query.page_size ?? 10),
      // sort by
      order: [[req.query.sort_by ?? 'created_at', req.query.sort_direction ?? 'ASC']],
    });

    res.status(200).json({
      page: req.query.page ?? 1,
      page_size: req.query.page_size ?? 10,
      addresses: rows.map((address) => address.toJSON()),
      total_items: count,
      total_pages: Math.ceil(count / (req.query.page_size ?? 10)),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
