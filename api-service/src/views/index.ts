import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { ensureToken } from '../middlewares/auth';
import { authRoutes } from './auth';
import { createCustomerView } from './createCustomer';

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
routes.get('/customers', expressAsyncHandler(createCustomerView));
routes.put('/customers/:customer_id', expressAsyncHandler(createCustomerView));
routes.delete('/customers/:customer_id', expressAsyncHandler(createCustomerView));
