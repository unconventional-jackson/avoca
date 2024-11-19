import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Address, Customer, CustomerCreate } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { AddressModel, getAddressId } from '../models/models/Addresses';
import { CustomerModel, getCustomerId } from '../models/models/Customers';

export async function createCustomerView(
  req: Request<unknown, unknown, CustomerCreate>,
  res: Response<Customer | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/createCustomer',
  });

  try {
    if (
      ![
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.mobile_number,
        req.body.home_number,
        req.body.work_number,
      ].some(Boolean)
    ) {
      res.status(400).json({
        error:
          'One of first_name, last_name, email, mobile_number, home_number, work_number are required.',
      });
      return;
    }

    const { addresses = [], ...customer } = req.body;

    const createdCustomer = await CustomerModel.create({
      id: getCustomerId(),
      ...customer,
    });

    const createdAddresses: Address[] = [];
    for (const address of addresses) {
      const createdAddress = await AddressModel.create({
        id: getAddressId(),
        customer_id: createdCustomer.id,
        ...address,
      });
      createdAddresses.push(createdAddress.toJSON());
    }

    res.status(201).json({
      ...createdCustomer.toJSON(),
      addresses: createdAddresses,
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
