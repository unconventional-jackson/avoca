import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { ensureToken } from '../middlewares/auth';
import { authRoutes } from './auth';
import { createCustomerView } from './createCustomer';
import { createCustomerAddressView } from './createCustomerAddress';
import { createJobView } from './createJob';
import { createPhoneCallView } from './createPhoneCall';
import { getCustomerView } from './getCustomer';
import { getCustomerAddressesView } from './getCustomerAddresses';
import { getCustomersView } from './getCustomers';
import { getJobsView } from './getJobs';
import { getPhoneCallView } from './getPhoneCall';
import { getPhoneCallsView } from './getPhoneCalls';
import { updateCustomerView } from './updateCustomer';
import { updatePhoneCallView } from './updatePhoneCall';

export const routes = Router();

// Health check
routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

// Auth
routes.use('/auth', authRoutes);

// Ensure Token Middleware
routes.use(expressAsyncHandler(ensureToken));

// Protected routes
routes.post('/customers', expressAsyncHandler(createCustomerView));
routes.get('/customers', expressAsyncHandler(getCustomersView));
routes.get('/customers/:customer_id', expressAsyncHandler(getCustomerView));
routes.get('/customers/:customer_id/addresses', expressAsyncHandler(getCustomerAddressesView));
routes.post('/customers/:customer_id/addresses', expressAsyncHandler(createCustomerAddressView));
routes.put('/customers/:customer_id', expressAsyncHandler(updateCustomerView));
routes.delete('/customers/:customer_id', expressAsyncHandler(createCustomerView));

routes.post('/phone-calls', expressAsyncHandler(createPhoneCallView));
routes.get('/phone-calls', expressAsyncHandler(getPhoneCallsView));
routes.get('/phone-calls/:phone_call_id', expressAsyncHandler(getPhoneCallView));
routes.put('/phone-calls/:phone_call_id', expressAsyncHandler(updatePhoneCallView));

routes.post('/jobs', expressAsyncHandler(createJobView));
routes.get('/jobs', expressAsyncHandler(getJobsView));
