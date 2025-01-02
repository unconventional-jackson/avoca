import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Customer } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerModel } from '../models/models/Customers';

type GetCustomerParams = {
  customer_id: string;
};

export async function getCustomerView(
  req: Request<GetCustomerParams>,
  res: Response<Customer | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getCustomer',
  });

  try {
    const customerModel = await CustomerModel.findByPk(req.params.customer_id);

    if (!customerModel) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.status(200).json(customerModel.toJSON());
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
