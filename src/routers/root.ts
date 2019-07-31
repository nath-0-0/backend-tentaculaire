import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

export const rootRouter = express.Router();

// main routes
const rootHandler = (req: Request, res: Response) => {
  // console.log('root route');
  res.send({ message: 'Welcome to my APIIII tenta' });
};
rootRouter.get('/', rootHandler);


const privateHandler = (req: Request, res: Response) => {
  // console.log('private route');
  res.send({ message: 'Welcome to private API' });
};
rootRouter.get('/private', authMiddleware, privateHandler);

const debugHandler = (req: Request, res: Response) => {
  // tslint:disable-next-line:no-debugger
  debugger;
  res.send({});
};
rootRouter.get('/debug', debugHandler);
