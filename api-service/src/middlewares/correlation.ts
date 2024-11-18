import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlation = v4();
  res.locals.correlation = correlation;
  next();
};
