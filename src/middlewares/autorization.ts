import { Request, Response } from 'express';

export const autorizationMiddleware = (req: Request, res: Response, next) => {
  // determine if user has right to do action
  // i.e: if user_id is the same that the one in url
  next();
};
