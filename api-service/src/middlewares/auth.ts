import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { EmployeeModel } from '../models/models/Employees';
import { getConfig } from '../utils/secrets';

export async function ensureToken(req: Request, res: Response, next: NextFunction) {
  const authorizationHeader = req.headers['Authorization'] ?? req.headers['authorization'] ?? '';
  const bearerToken = authorizationHeader.toString().split(' ').pop();

  if (!bearerToken) {
    res.status(401).json({ message: 'Missing Bearer Token' });
    return;
  }

  try {
    const config = await getConfig();
    const decodedToken = jwt.verify(bearerToken, config.ACCESS_TOKEN_SECRET);
    if (typeof decodedToken !== 'string' && 'employee_id' in decodedToken) {
      const employee = await EmployeeModel.findByPk(decodedToken.employee_id);
      if (employee) {
        res.locals.employee_id = employee.employee_id;
        next();
        return;
      }
    }

    res.status(401).json({ message: 'Invalid Token' });
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
