import { Request, Response } from 'express';
import * as  jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request & { tokenContent?: any }, res: Response, next) => {
  const token = req.header('Authorization');

  console.log('authMiddleware');
  try {
    const tokenContent = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenContent = tokenContent;
    // token valid & not expired
    next(); // TOASK the next
  }
  catch (e) {
    // token invalid
    console.log('error token: ', e);
    
    res.status(401).send({ error: 401 });
  }
};