import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

// TO DO: validation des id
import {
  httpError400,
  httpError401,
  httpError403,
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
  const { dateFrom, dateTo, message, name} = req.body;
  console.log(message);
  console.log(name);
  if (dateTo < dateFrom) {
    res.status(400).send(httpError403('la date de début est plus grande que la date de retour'));
  }

// tester si c'est une date TODO

// creating new document
  const newLend = new LendModel();
  newLend.dateFrom = dateFrom;
  newLend.dateTo = dateTo;
  newLend.message = message;
  newLend.idUserBorrower = borrower_id;
  newLend.idUserLender = lender_id;
  newLend.item =  { item_id: item_id, name: name};

  const newNotif = new Object(
    {
      user_id: borrower_id,
      title: 'Une demande de prêt',
      date: Date.now,
      text: 'string',
    }
  );

  newLend.save()
    .then((lend)=>(
      UserModel.findById(lender_id) // validate user id
      .then(user => {
        if (!user) {
          res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
          return;
        }
        return UserModel.addNotification(lender_id, newNotif); // add Item to user
        return lend;
        })
    )
    .then((lend) => res.send({lend}))
    .catch (err => res.status(500).send(httpError500(null,''+ err))));




};
lendRouter.post('/:borrower_id/:lender_id/:item_id', askLendHandler); // TODO add validate for item_id

// answer yes or no to lend the item ------------------------------------------------
// TODO modifier l'^étati de l'item à unavaible si l'objet est pèrèté
const answerLendHandler = (req: Request, res: Response, ) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body; // modification objet accepted.ask /accepted.message


  LendModel.findByIdAndUpdate(
    lend_id,
    { $set: partialLend},
    { new: true, runValidators: true, strict: true }
  )
  .then((lend) => {
    if (!lend) {
      return res.status(401).send(httpError403(`wrong Id, item lend doesn't exist`));
    }
    res.send({lend});
  })
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/ask/', answerLendHandler);


// make the lend as returned ------------------------------------------------
// TODO modifier l'^étati de l'item à avaible si l'objet est pèrèté

const returnLendHandler = (req: Request, res: Response) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body; // modification propriété returned

  LendModel.findByIdAndUpdate(
    lend_id,
    { $set: partialLend},
    { new: true, runValidators: true, strict: true }
  )
  .then((lend) => {
    if (!lend) {
      return res.status(401).send(httpError403(`wrong Id, item lend doesn't exist`));
    }
 // .then ()
    res.send({lend});
  })
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/return/', returnLendHandler);


// rate afer return ------------------------------------------------
const ratingLendHandler = (req: Request, res: Response) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body;  // isDamaged: boolean; isLate: boolean;

  LendModel.findByIdAndUpdate(
    lend_id,
    { $set: partialLend},
    { new: true, runValidators: true, strict: true }
  )
  .then((lend) => {
    if (!lend) {
      return res.status(401).send(httpError403(`wrong Id, row lend doesn't exist`));
    }
    res.send({lend});
  })
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/rating/', ratingLendHandler);

// cancel the lend ---------------------------------------------- TODO
const cancelLendHandler = (req: Request, res: Response) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body;  // TODO

  LendModel.deleteOne(
    {_id: lend_id})
   .then((lend) => {
    if (lend.n === 0) {
      return res.status(401).send(httpError403(`wrong Id, row lend doesn't exist, no delete`));
    }
    res.send({lend});
  });
};
lendRouter.delete('/:lend_id', cancelLendHandler);

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
