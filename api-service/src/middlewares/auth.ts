import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { UserModel } from '../models/models/Users';
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
    if (typeof decodedToken !== 'string' && 'userId' in decodedToken) {
      const user = await UserModel.findByPk(decodedToken.userId);
      if (user) {
        res.locals.userId = user.userId;
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
