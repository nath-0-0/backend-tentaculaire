import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { UserModel, IUserDoc, IUser } from '../models/user';
import { httpError500, httpError400, httpError401 } from '../helpers/http';
import { Types } from 'mongoose';

export const itemRouter = express.Router();

// .../search?q=terme&d=1000&lat=12.4354456456&long=24.3821469736

const searchItemHandler = (req: Request, res: Response) => {
    const search = req.params.q;
    const distance = +req.params.d;
    const lat = +req.params.lat;
    const long = +req.params.long;

// ([46.163296, 6.144295], 10000)
    UserModel.findByCoordinates([lat, long], distance)
    .then((users) => users.find(
      {'items.name': {'$regex' : search, '$options' : 'i'}}
    ))
    .then((items) => res.send({items}))
    .catch (err => res.status(500).send(httpError500('' + err)));
  };
itemRouter.get('/search/:q/:d/:lat/:long', searchItemHandler);


// retourne un item
const getItemByIdHandler = (req: Request, res: Response) => {
  const item_id = Types.ObjectId(req.params.item_id);
  const stages = [{
    $project: {
      _id: 0,
      items: 1
    }
  }, {
    $unwind: {
      path: '$items',
      preserveNullAndEmptyArrays: false
    }
  }, {
    $replaceRoot: {
      newRoot: '$items'
    }
  }, {
    $match: {
      _id: Types.ObjectId('5d4017129571a71fda1bb6e9')
    }
  }];

  UserModel.aggregate(stages)
           .exec()
           .then((item) => res.send({item}))
           .catch (err => res.status(500).send(httpError500(err)));


};
itemRouter.get('/:item_id', getItemByIdHandler);

const askItemHandler = (req: Request, res: Response) => {
};
itemRouter.get('/search/:q/:d/:lat/:long', askItemHandler);
