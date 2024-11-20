import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { EmployeeModel } from '../models/models/Employees';
import { getConfig } from '../utils/secrets';

export async function ensureToken(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await getConfig();

    // First, verify if this is a user

    const authorizationHeader = req.headers['Authorization'] ?? req.headers['authorization'] ?? '';
    const bearerToken = authorizationHeader.toString().split(' ').pop();

    const apiKey = req.headers['x-api-key'] ?? '';

    if (apiKey) {
      if (apiKey !== config.CALLS_SERVICE_API_KEY) {
        res.status(401).json({ message: 'Invalid API Key' });
        return;
      }

      if (apiKey === config.CALLS_SERVICE_API_KEY) {
        next();
        return;
      }
    }

    if (bearerToken) {
      const decodedToken = jwt.verify(bearerToken, config.ACCESS_TOKEN_SECRET);
      if (typeof decodedToken !== 'string' && 'employee_id' in decodedToken) {
        const employee = await EmployeeModel.findByPk(decodedToken.employee_id);
        if (employee) {
          res.locals.employee_id = employee.employee_id;
          next();
          return;
        }
      }
    }
    res.status(401).json({ message: 'Missing Authorization' });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token Expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid Token' });
    } else if (error instanceof jwt.NotBeforeError) {
      res.status(401).json({ message: 'Token Not Active' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
