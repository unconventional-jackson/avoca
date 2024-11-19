import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Customer, CustomerUpdate } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerModel } from '../models/models/Customers';

export async function updateCustomerView(
  req: Request<
    {
      customer_id: string;
    },
    unknown,
    CustomerUpdate
  >,
  res: Response<Customer | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/updateCustomer',
  });

  try {
    if (!req.params.customer_id) {
      res.status(400).json({
        error: 'Customer ID is required.',
      });
      return;
    }

    const customer = await CustomerModel.findByPk(req.params.customer_id);
    if (!customer) {
      res.status(404).json({
        error: 'Customer not found.',
      });
      return;
    }

    await customer.update(req.body);

    res.status(201).json({
      ...customer.toJSON(),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
