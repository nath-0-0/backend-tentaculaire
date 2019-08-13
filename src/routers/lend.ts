import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';


import {
  httpError400,
  httpError401,
  httpError403,
  httpError500,
  mongoError
} from '../helpers/http';
import { UserModel } from '../models/user';
import { Types } from 'mongoose';
import { LendModel } from '../models/lend';

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

  if (dateTo < dateFrom) {
    res.status(400).send(httpError403('la date de début est plus grande que la date de retour'));
  }

// tester si c'est une date TODO



const newLend = new LendModel();
  // check id
  UserModel.findOne({ _id : borrower_id}) //
  .then(user => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user borrower doesn't exist`));
      return;
    }
  });
  UserModel.findOne({ _id : lender_id})
  .then(user => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user lender doesn't exist`));
      return;
    }
  });
  UserModel.findOne({ _id: lender_id , 'items._id': item_id })
  .then (useritem => {
    if (!useritem) {
      res.status(401).send(httpError401(`Wrong Id, item doesn't exist`));
      return;
    }
  });
// creating new document
newLend.dateFrom = dateFrom;
newLend.dateTo = dateTo;
newLend.message = message;
newLend.idUserBorrower = borrower_id;
newLend.idUserLender = lender_id;
newLend.item =  { item_id: item_id, name: name};

  // save new lend
  newLend.save()
       .then(lend => {
       // TOASK est-ce ok?
        const newNotif = new Object(
          {
            lend_id: lend._id,
            title: 'Une demande de prêt',
            date: Date.now,
            text: 'string',
          }
        );
        console.log(newNotif);
        return UserModel.addNotification(lender_id, newNotif); // add Item to user
        return lend;
        })
    .then((lend) => res.send({lend}))
    .catch (err => res.status(500).send(httpError500(null, '' + err)));
};
lendRouter.post('/:borrower_id/:lender_id/:item_id', askLendHandler); // TODO add validate for item_id

// answer yes or no to lend the item ------------------------------------------------
// REMARQUE l'objet n'est pas unvailable lorsqu il est en prêt car peut etre dispo à autre date
// TODO check au moment de la demande et selon les dates VERSION 2
const answerLendHandler = (req: Request, res: Response, ) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body; // modification objet accepted.ask /accepted.message


  const newNotif = new Object(
    {
      lend_id: lend_id,
      title: partialLend.accepted.ask ? 'Votre demande d emprunt a été acceptée' : 'Votre demande d\'emprunt a étét refusée',
      date: Date.now,
      text: partialLend.accepted.message
    }
  );

  LendModel.findByIdAndUpdate(
    lend_id,
    { $set: partialLend},
    { new: true, runValidators: true, strict: true }
  )
  .then((lend) => {
    if (!lend) {
      return res.status(401).send(httpError403(`wrong Id, item lend doesn't exist`));
    }// TOASK
    // return UserModel.addNotification(Types.ObjectId(lend.idUserLender), newNotif); // add Item to user
  })
  .then((lend) => res.send({lend}))
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/ask', answerLendHandler);


// make the lend as returned ------------------------------------------------
const returnLendHandler = (req: Request, res: Response) => {
  const lend_id = Types.ObjectId(req.params.lend_id);
  const partialLend = req.body; // modification propriété returned

  const newNotif = new Object(
    {
      lend_id: lend_id,
      title: 'L objet emprunté a été signalé rendu',
      date: Date.now,
      text: 'string',
    }
  );

  LendModel.findByIdAndUpdate(
    lend_id,
    { $set: partialLend},
    { new: true, runValidators: true, strict: true }
  )
  .then((lend) => {
    if (!lend) {
      return res.status(401).send(httpError403(`wrong Id, item lend doesn't exist`));
    }
   // return UserModel.addNotification(lend.idUserLender, newNotif); // add Item to user
  })
  .then((lend) => res.send({lend}))
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/return', returnLendHandler);


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
  })
  .then((lend) => res.send({lend}))
  .catch (err => res.status(500).send(httpError500(null, err)));

};
lendRouter.post('/:lend_id/rating', ratingLendHandler);

// cancel the lend ---------------------------------------------- TODO
const cancelLendHandler = (req: Request, res: Response) => {
  const lend_id = Types.ObjectId(req.params.lend_id);

  const newNotif = new Object(
    {
      lend_id: lend_id,
      title: 'La demande de prêt a été annulée',
      date: Date.now,
      text: 'string',
    }
  );

  LendModel.deleteOne(
    {_id: lend_id})
   .then((lend) => {
    if (lend.n === 0) {
      return res.status(401).send(httpError403(`wrong Id, row lend doesn't exist, no delete`));
    }
  // return UserModel.addNotification(lend.idUserLender, newNotif); // add Item to user
})
  .then((lend) => res.send({lend}))
  .catch (err => res.status(500).send(httpError500(null, err)));

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
