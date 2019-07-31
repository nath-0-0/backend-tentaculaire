import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { httpError500, httpError400, httpError401 } from '../helpers/http';
import { UserModel } from '../models/user';
// import { ItemModel } from '../models/item';
import { Types } from 'mongoose';

export const userRouter = express.Router();

// main routes
const userHandler = (req: Request, res: Response) => {
  res.send({ message: 'Welcome to my APIIII user tenta' });
};
userRouter.get('/', userHandler);

// add a item to a user
const addItemHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const newItem = req.body;
  // validate params values
  if (!user_id) {
    return res.status(401).send(httpError401('Id is missing'));
  }

  UserModel.addItem(user_id, newItem)
           .then((user) => res.send({user}))
           .catch (err => res.status(500).send(httpError500(err)));

};
userRouter.post('/:user_id/item', addItemHandler);

// remove a item from a user
const removeItemHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);

  UserModel.findByIdAndUpdate(
    user_id,
    { $pull: {  items: { _id: item_id } } },
    { new: true, runValidators: true, strict: true }
  )
  .then((user) => res.send({user}))
  .catch (err => res.status(500).send(httpError500(err)));
};
userRouter.delete('/:user_id/:item_id', removeItemHandler);


// liste les items de l'utilisateurs
const ItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const userToUpdate = req.body;
  UserModel.findById(
    user_id,
    {items: 1 }
  )
  .then((items) => res.send({items}))
  .catch (err => res.status(500).send(httpError500(err)));
};
userRouter.get('/:user_id/listItem', ItemsHandler);


// update a user
const updateUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const partialUser = req.body;
  UserModel.findByIdAndUpdate(
    user_id,
    { $set: partialUser},
    { new: true, runValidators: true, strict: true }
  )
  .then((user) => res.send({user}))
  .catch (err => res.status(500).send(httpError500(err)));
};
userRouter.put('/:user_id', updateUserHandler);

/*
.get(function (req, res) {
  UserModel.findById(req.params.piscine_id, function (err, piscine) {
    if (err)
      res.send(err);
    res.json(piscine);
  });
});

*/



