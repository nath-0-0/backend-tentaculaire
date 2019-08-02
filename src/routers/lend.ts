import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

import {
  httpError400,
  httpError401,
  httpError500,
  mongoError
} from '../helpers/http'; 
import { UserModel, IUser } from '../models/user';
// import { ItemModel } from '../models/item';
import { Types } from 'mongoose';
import { LendModel } from '../models/lend';
import { ObjectID } from 'bson';

export const lendRouter = express.Router();

// main routes
const userHandler = (req: Request, res: Response) => {
  res.send({ message: 'Welcome to my APIIII user tenta' });
};
lendRouter.get('/', userHandler);

// ask for borrow a item  ------------------------------------------------
const askLendHandler = (req: Request, res: Response) => {
   const borrower_id = req.params.borrower_id;
  // const borrower_id = Types.ObjectId(req.params.borrower_id);
  const lender_id = req.params.lender_id;
  // const lender_id = Types.ObjectId(req.params.lender_id);
  const item_id = (req.params.item_id);
  const { dateFrom, dateTo, message} = req.body;
  console.log(new Date(dateFrom));
  // check validatation
  if (!dateTo || !dateFrom || !borrower_id || !lender_id || !item_id) {
    res.status(400).send(httpError400('la dates à partir de et jusqu à sont obligatoires'));
  }
   if (dateTo < dateFrom) {
     res.status(400).send(httpError400('la date de début est plus grande que la date de retour'));
   }
// creating new document
  const newLend = new LendModel();
  // newLend.dateFrom = new Date(dateFrom).getTime();
  // console.log(new Date(dateFrom).getTime());
  newLend.dateFrom = new Date(dateFrom);
  newLend.dateTo = new Date(dateTo);
  newLend.message = message;
  newLend.idUserBorrower = borrower_id;
  newLend.idUserLender = lender_id;
  newLend.item =  { item_id: item_id, name: message};  // {item_id,'test'};
  // console.log(newLend);

  //
  newLend.save()
    .then((lend) => res.send({lend}))
    .catch (err => res.status(500).send(httpError500(undefined, err)));

};
lendRouter.post('/:borrower_id/:lender_id/:item_id', askLendHandler);

/*

db.lend.insert({ isLate: false,
  isDamaged: false,
  returned: false,
  dateAsk: 1564765443185,
  dateFrom: 1569674715000,
  dateTo: 1569847515000,
  idUserBorrower: ObjectId('5d3fff60dc91fe4729f39fb3'),
  idUserLender: ObjectId('5d3fff60dc91fe4729f39fb3'),
  idUserBorrower: ObjectId('5d41605b3363b039a7457bf9')
});
  */
