import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { ensureToken } from '../middlewares/auth';
import { authRoutes } from './auth';
import { createCustomerView } from './createCustomer';
import { createPhoneCallView } from './createPhoneCall';
import { getCustomersView } from './getCustomers';
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

// TODO: Protected routes
routes.post('/customers', expressAsyncHandler(createCustomerView));
routes.get('/customers', expressAsyncHandler(getCustomersView));
routes.put('/customers/:customer_id', expressAsyncHandler(updateCustomerView));
routes.delete('/customers/:customer_id', expressAsyncHandler(createCustomerView));

routes.post('/phone-calls', expressAsyncHandler(createPhoneCallView));
routes.get('/phone-calls', expressAsyncHandler(getPhoneCallsView));
routes.put('/phone-calls/:phone_call_id', expressAsyncHandler(updatePhoneCallView));
