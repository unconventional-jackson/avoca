import { NodeLogger } from '@unconventional-code/observability-sdk';
import { Address, CustomerCreateAddressesInner } from '@unconventional-jackson/avoca-external-api';
import { ErrorResponse } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { AddressModel, getAddressId } from '../models/models/Addresses';

type CreateCustomerAddressParams = {
  customer_id: string;
};
export async function createCustomerAddressView(
  req: Request<CreateCustomerAddressParams, unknown, CustomerCreateAddressesInner>,
  res: Response<Address | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/createCustomerAddress',
  });

  try {
    if (
      ![req.body.street, req.body.state, req.body.city, req.body.zip, req.body.country].some(
        Boolean
      )
    ) {
      res.status(400).json({
        error: 'Missing required fields in the body.',
      });
      return;
    }

    const createdAddress = await AddressModel.create({
      id: getAddressId(),
      customer_id: req.params.customer_id,
      ...req.body,
    });
    res.status(201).json({
      ...createdAddress.toJSON(),
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
