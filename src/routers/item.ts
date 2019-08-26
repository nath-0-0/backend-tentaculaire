import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { UserModel, IUserDoc, IUser } from '../models/user';
import { httpError500, httpError400, httpError401, httpError403 } from '../helpers/http';
import { Types } from 'mongoose';
import { SlowBuffer } from 'buffer';

export const itemRouter = express.Router();


// recherche des items d'après une geolocalisatio, distance et chaine de caractère
const searchItemHandler = (req: Request, res: Response) => {
     const txt = req.params.q;
     const distance = +req.params.d;
     const lat = +req.params.lat;
     const long = +req.params.long;


    if (!lat || !long) {
      return res.status(401).send(httpError403(`place is missing or doesn't exist`));
    }
    if (!txt) {
      return res.status(401).send(httpError403(`search is missing`));
    }


    UserModel.findByCoordinates([lat, long], distance, txt)
    .then((items) => res.send(items))
    .catch (err => res.status(500).send(httpError500(null, err)));
  };
itemRouter.get('/search/:q/:d/:lat/:long', searchItemHandler); // mot / distance/ latitude / longitude


// retourne un item ------------------------------------------------------------------------
const getItemByIdHandler = (req: Request, res: Response) => {
  // const item_id = Types.ObjectId(req.params.item_id);
  const item_id = (req.params.item_id);  //  pourquoi erreur???? je n'arrive pas en mettant eun  Types.Object TOASK

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
      _id: Types.ObjectId(item_id)
    }
  }];

  UserModel.aggregate(stages)
           .exec()
           .then((item) => {
             if (item.length === 0) {
              return res.status(401).send(httpError403(`wrong Id, item doesn't exist`));
            }
            console.log(item[0]);
             res.send(item[0]);
            })
           .catch (err => res.status(500).send(httpError500(null, err)));



};
itemRouter.get('/edit/:item_id', getItemByIdHandler);

// update un item ------------------------------------------------------------------------
const updateItemHandler = (req: Request, res: Response) => {
  const item_id = (req.params.item_id);  //  pourquoi erreur???? je n'arrive pas en mettant eun  Types.Object TOASK
  const user_id = (req.params.user_id);
  const partialItem = req.body;

  UserModel.updateOne( // TOASK  peux mieux faire? DEvrait mieux faire
    { _id: user_id , 'items._id': item_id },
        { $set: { 'items.$.name': partialItem.name,
                  'items.$.description': partialItem.description,
                  'items.$.deposit': partialItem.deposit,
                  'items.$.enabled': partialItem.enabled,
      } },
        { upsert: true },
   /* { },
    { $set: { "items.$[elem]" : partialItem } },
    { arrayFilters: [ { "elem._id": item_id  } ], upsert: true },
 */
  )
  .then((item) => {
    if (!item) {
      return res.status(401).send(httpError403(`wrong Id, item lend doesn't exist`));
    }
    console.log();
    res.send(req.body);
  })
  .catch (err => res.status(500).send(httpError500(null, err)));

};
itemRouter.put('/:user_id/:item_id', authMiddleware, updateItemHandler);


