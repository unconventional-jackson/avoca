import { NodeLogger } from '@unconventional-code/observability-sdk';
import { ErrorResponse, PhoneCall } from '@unconventional-jackson/avoca-internal-api';
import { Request, Response } from 'express';

import { CustomerModel } from '../models/models/Customers';
import { EmployeeModel, InternalEmployee } from '../models/models/Employees';
import { JobModel } from '../models/models/Jobs';
import { PhoneCallModel } from '../models/models/PhoneCalls';

type GetPhoneCallParams = {
  phone_call_id: string;
};

export async function getPhoneCallView(
  req: Request<GetPhoneCallParams>,
  res: Response<PhoneCall | ErrorResponse>
) {
  const log = new NodeLogger({
    correlation: res.locals.correlation,
    name: 'views/getPhoneCall',
  });

  try {
    const phoneCallModel = await PhoneCallModel.findByPk(req.params.phone_call_id);

    if (!phoneCallModel) {
      res.status(404).json({ error: 'Phone call not found' });
      return;
    }

    const phoneCall = phoneCallModel.toJSON();

    let employee: PhoneCall['employee'] | undefined;
    if (phoneCall.employee_id) {
      const employeeModel = await EmployeeModel.findByPk(phoneCall.employee_id, {
        attributes: [
          'employee_id',
          'email',
          'last_active_at',
          'avatar_url',
          'color_hex',
          'first_name',
          'last_name',
          'mobile_number',
          'role',
          'permissions',
        ],
      });
      employee = employeeModel?.toJSON() as InternalEmployee;
    }

    let job: PhoneCall['job'] | undefined;
    if (phoneCall.job_id) {
      const jobModel = await JobModel.findByPk(phoneCall.job_id);
      job = jobModel?.toJSON() as PhoneCall['job'];
    }

    let customer: PhoneCall['customer'] | undefined;
    if (phoneCall.customer_id) {
      const customerModel = await CustomerModel.findByPk(phoneCall.customer_id);
      customer = customerModel?.toJSON() as PhoneCall['customer'];
    }

    res.status(200).json({
      ...phoneCall,
      employee,
      job,
      customer,
      start_date_time: phoneCall.start_date_time?.toISOString(),
      end_date_time: phoneCall.end_date_time?.toISOString(),
    } as PhoneCall);
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: String(error) });
  }
}
