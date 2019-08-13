import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { httpError500, httpError400, httpError401 } from '../helpers/http';
import { UserModel } from '../models/user';
import { LendModel } from '../models/lend';
import { ItemModel } from '../models/item';
import { Types } from 'mongoose';
import { urlValidator } from '../validators';

export const userRouter = express.Router();

const userHandler = (req: Request, res: Response) => {
  res.send({ message: 'Welcome to my APIIII user tenta' });
};
userRouter.get('/', userHandler);


// routes -------------------------------------------------------------------------
// add a item to a user------------------------------------
const addItemHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const newItem = req.body;

    UserModel.findById(user_id) // validate user id
    .then(user => {
      if (!user) {
        res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
        return;
      }
      return UserModel.addItem(user_id, newItem); // add Item to user
      })
    .then((user) => res.send({user}))
    .catch (err => res.status(500).send(httpError500(null, err)));

};
userRouter.post('/:user_id/addItem', addItemHandler);

// remove a item from a user------------------------------------
const removeItemHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);

  if (!user_id || !item_id) {
    return res.status(401).send(httpError400('User Id or Item id is missing'));
  }

  ItemModel.findById(item_id) // validate item id   SK faut faire toutes ceds validation???????? on peut pas faire un truc plus generique
    .then(item => {
      if (!item) {
        res.status(401).send(httpError401(`Wrong Id, item doesn't exist`));
        return;
      }
    return UserModel.findByIdAndUpdate(
      user_id,
      { $pull: {  items: { _id: item_id } } },
      { new: true, runValidators: true, strict: true }
    )
    .then((user) => {
      if (!user) {
        res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
        return;
      }
      res.send({user});
    })
    .catch (err => res.status(500).send(httpError500(null, err)));
  });
};
userRouter.delete('/:user_id/:item_id', removeItemHandler);


// liste les items de l'utilisateurs------------------------------------
const ItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);

  if (!user_id) {
    return res.status(401).send(httpError400('User Id is missing'));
  }

  UserModel.findById(
    user_id,
    {items: 1 ,_id:0}
  )
  .then((user) => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
    res.send({user});
  })
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.get('/:user_id/listItem', ItemsHandler);


// update a user------------------------------------ TODO
const updateUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const partialUser = req.body;

  UserModel.findByIdAndUpdate(
    user_id,
    { $set: partialUser},
    { new: true, runValidators: true, strict: true }
  )
  .then((user) => res.send({user}))
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.put('/:user_id', updateUserHandler);

// add a favortie to the user------------------------------------ TODO validate
const addToFavoriteUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);
  // validate params values
  if (!user_id || !item_id) {
    return res.status(401).send(httpError400('Id is missing'));
  }

  UserModel.findByIdAndUpdate(  /// TODO check user id
    { _id: user_id },
    { $push: { favorite: item_id} },
    { new: true, runValidators: true, strict: true }
  )
  .then((favorite) => res.send({favorite}))
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.post('/:user_id/:item_id/addToFavorite', addToFavoriteUserHandler);

// remove a favorite from a user------------------------------------
const removeFromFavoriteUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);

  UserModel.findByIdAndUpdate(  /// TODO check user id item_id
    { _id: user_id },
    { $pull: { favorite: item_id} },
    { new: true, runValidators: true, strict: true }
  )
  .then((user) => res.send({user}))  
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.delete('/:user_id/:item_id/removeFromFavorite', removeFromFavoriteUserHandler);

// liste les emprunts de l'utilisateurs------------------------------------   TODO
const BorrowItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);

  LendModel.find(
    user_id,
    {items: 1 }
  )
  .then((items) => res.send({items}))
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.get('/:user_id/listItemBorrowed', BorrowItemsHandler);

// liste les prêts de l'utilisateurs----------------------------------------------------------  TODO
const LendItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);

  if (!user_id) {
    return res.status(401).send(httpError400('User Id is missing'));
  }


// https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/index.html#examples
const stages = [{$lookup:
  {from: 'users.items',
  localField: '_id',
  foreignField: 'item_id',
  as: 'items'}},
{ '$unwind': '$itemId' }

];

console.log('coucou');
LendModel.aggregate(stages)
           .exec()
           .then((item) => {
             res.send({item});
            })
           .catch (err => res.status(500).send(httpError500(null, err)));



};
userRouter.get('/:user_id/listItemLent', LendItemsHandler);


/*
db.user.findByIdAndUpdate(
  '5d40ab91168aca30a689c527', // ObjectId(user_id)
       {  $push: { 'favorite': '5d4017129571a71fda1bb6e9' } },
     { new: true, runValidators: true, strict: true }


     */




