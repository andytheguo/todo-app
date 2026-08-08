import {type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  try {
    if (!token) {
      throw new Error();
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    req.userId = payload.userId;

    next();
  }
  catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}
