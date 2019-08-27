// TODO CHECK USER  CHECK AND REPLACE ERROR   si on veut mettre unobjet en pret coor doit etre resneigné
import {
  Schema,
  model as mongooseModel
} from 'mongoose';
import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { httpError500, httpError400, httpError401, mongoError} from '../helpers/http';
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

// retourne un utilisateur------------------------------------
const getUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
 console.log('user_id', user_id);
  UserModel.findById(
    user_id,
  )
  .then((user) => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
      res.send(user);
  })
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.get('/edit/:user_id', getUserHandler); // TODO sans le chemin edit a améliorer

// update a user------------------------------------
const updateUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const partialUser = req.body;

  // hash password if changed
  if (req.body.password) {
    partialUser.password = UserModel.hashPassword(req.body.password);
  }



  UserModel.findByIdAndUpdate(
    user_id,
    { $set: partialUser},
    { new: true, runValidators: true, strict: true }
  )
  .then((user) => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
    res.send({user});
  })
  .catch (err => res.status(500).send(httpError500(null, '' + err)));

};
userRouter.put('/update/:user_id', updateUserHandler);

// ***********************************************************************
// ITEMS
// ***********************************************************************

// add a item to a user------------------------------------ INSERT ITEM
const addItemHandler = (req: Request, res: Response) => {
  const user_id = (req.params.user_id);
  const newItem = req.body;

    UserModel.findById(user_id) // validate user id
    .then(user => {
      if (!user) {
        res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
        return;
      }
      if (!user.homeLocation) {
        return mongoError('Veuillez renseigner votre adresse pour insérer un objet', null);
      }
      return UserModel.addItem(user_id, newItem); // add Item to user
      })
    .then((user) => res.send({user}))
    .catch (err => res.status(500).send(httpError500(err, err)));

};
userRouter.post('/:user_id/addItem', authMiddleware, addItemHandler);

// remove a item from a user------------------------------------ // DELETE
const removeItemHandler = async (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);


  await UserModel.findOne({ _id: user_id , 'items._id': item_id })
  .then (useritem => {
    if (!useritem) {
      res.status(401).send(httpError401(`Wrong Id, item doesn't exist`));
      return;
    }
  });
  await UserModel.findOne({ _id : user_id})
  .then(user => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
  });

    UserModel.findByIdAndUpdate(
      user_id,
      { $pull: {  items: { _id: item_id } } },
      { new: true, runValidators: true, strict: true }
    )
    .then((user) => {
      if (!user) {
        res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
        return;
      }
      res.send(user);
    })
    .catch (err => res.status(500).send(httpError500(null, err)));

};
userRouter.delete('/:user_id/:item_id', authMiddleware, removeItemHandler);

// liste les items de l'utilisateurs------------------------------------
const ItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);


  UserModel.findById(
    user_id,
    {items: 1 , _id: 0}
  )
  .then((user) => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
     res.send(user.items);
  })
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.get('/:user_id/listItem', authMiddleware, ItemsHandler);



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
  .then((user) => {
    if (!user) {
      res.status(401).send(httpError401(`Wrong Id, user doesn't exist`));
      return;
    }
    res.send(user);
  })
  .catch (err => res.status(500).send(httpError500(null, err)));
};
userRouter.post('/:user_id/:item_id/addToFavorite', authMiddleware,  addToFavoriteUserHandler);

// remove a favorite from a user------------------------------------
const removeFromFavoriteUserHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);
  const item_id = Types.ObjectId(req.params.item_id);

  UserModel.findByIdAndUpdate(  /// TODO check user id item_id
    { _id: user_id },
    { $pull: { favorite: item_id} },
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
};
userRouter.delete('/:user_id/:item_id/removeFromFavorite', authMiddleware, removeFromFavoriteUserHandler);

// liste les emprunts de l'utilisateurs------------------------------------   TODO
const BorrowItemsHandler = (req: Request, res: Response) => {
  const user_id = Types.ObjectId(req.params.user_id);

  LendModel.find(
    user_id,
    {items: 1 }
  )
  .then((items) => res.send(items))
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

LendModel.aggregate(stages)
           .exec()
           .then((item) => {
             res.send({item});
            })
           .catch (err => res.status(500).send(httpError500(null, err)));



};
userRouter.get('/:user_id/listItemLent', LendItemsHandler);

// TODO liste notificatins listre favoris
// TODO TOASK si utilisateur sort un objet, faut il que je l'efface dans tous les favoris!
// on peut mettre message erreur




