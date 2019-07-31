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
    const latitude = +req.params.lat;
    const longitude = +req.params.long;
    // const stageGeo = {
    //   $geoNear: {
    //     spherical: false,
    //     distanceField: 'dist.calculated',
    //     limit: 50,
    //     maxDistance: 100000,
    //     near: { type: 'Point', coordinates: [46.163296, 6.144295 ] },
    //   }


    UserModel.findByCoordinates([46.163296, 6.144295], 10000)
    // .then((users) => UserModel.find(
    //   {'items.title': search}
    // ))
    .then((items) => res.send({items}))
    .catch (err => res.status(500).send(httpError500(err)));
  };
itemRouter.get('/search', searchItemHandler);


// liste les items de l'utilisateurs
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

/*
itemRouter.route('/user/:user_id')
.get(function(req,res){
            Piscine.findById(req.params.piscine_id, function(err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
})
*/

/*
db.users.aggregate([{ $project: { _id:0, items:1 } },  { $unwind: { path: '$items', preserveNullAndEmptyArrays: false } }, { $replaceRoot: { newRoot: "$items" } } ,{ $match: { _id: ObjectId('5d4017129571a71fda1bb6e9')  }  } ]).pretty()
{
	"enabled" : true,
	"_id" : ObjectId("5d4017129571a71fda1bb6e9"),
	"name" : "tondeuse",
	"description" : "pour petite parcelle",
	"deposit" : 20
}
>
*/


