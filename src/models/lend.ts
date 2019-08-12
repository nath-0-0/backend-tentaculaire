import {
    Schema,
    Model,
    Document,
    model as mongooseModel
  } from 'mongoose';
// import { ItemModel } from './conversation';
import { itemSchema } from './item';
import { UserModel } from './user';

  // utilisaer imgur pour stocker lîmage
  // fork sur github pour reprendre un projet



  // main interface
  export interface ILend {
   // id_user: string;  // si l'utilisateur desactive son compte, on met ancien user>> je voudrais avoir accès au mail et/numéro tel
   // ASK
    item: {item_id: Schema.Types.ObjectId, name: string}; // pour l'historique, celui ci peut apparait donc encore si l'objet n'existe plus
    dateFrom: number; // ASK
    dateTo: number;
    dateAsk: number;
    isDamaged: boolean;
    isLate: boolean;
    accepted: {ask: boolean, message: string}; //  ask askOk Out refused history (confirmIn) --> 7 jours après History
    returned: boolean;
    idUserBorrower: Schema.Types.ObjectId;
    idUserLender: Schema.Types.ObjectId;
      // UserBorrower: {user_id: string, contact: string};
    // UserLender: {user_id: string, contact: string};
    message: string; // message pouvant accompagner la demande de prêt
  }

  // document interface, define custom methods here
  // export interface IUserDoc extends Document, IUser {

  export interface ILendDoc extends Document, ILend {
    [x: string]: any;
    newLend: any;
  }

  // model interface, define custom static methods here
  interface ILendModel extends Model<ILendDoc> {
    // insertOne(arg0: { newLend: ILendDoc; });
    // insert: any;
  }

  // schema definition
  const FKHelper = require('./../helpers/foreign-key-helper');

  export const lendSchema = new Schema<ILendDoc>({
    idUserBorrower: {
      type: Schema.Types.ObjectId,
      required: true,
       ref: 'users',
       validate: {
        isAsync: true,
        validator: function(v) {
          return FKHelper(UserModel.model('users'), v);
        },
      }
    },
    idUserLender: {
      type: Schema.Types.ObjectId,
      required: true,
       ref: 'users',
       validate: {
        isAsync: true,
        validator: function(v) {
          return FKHelper(UserModel.model('users'), v);
        },
      }
 
    },
    item: { // ASK c'est juste?
      item_id: {  // ITEM
        type: Schema.Types.ObjectId,  // TODO add validate for item_id
        required: false
      },
      name: {  // ITEM
        type: String,
        required: false,
        }
    },
    dateFrom: {
      type: Number,
      required: false,
    },
    dateTo: {
      type: Number,
      required: false, // date to plus grande que date from est-ce qu'on opeut faire un validate à ce point ASK
    },                // voir avec compare password TODO
    dateAsk: {
      type: Number,
      default: Date.now
    },
    isLate: {
      type: Boolean,
      default: false,
      required: false,
    },
    isDamaged: {
      type: Boolean,
      default: false,
      required: false,
    },
    returned: {
      type: Boolean,
      default: false,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    accepted: {
      ask: {
      type: Boolean
      },
      message: {
        type: String,
        required: false,
      },
      required : false,
    },
    message: {
      type: String,
      required: false,
    },
  });

  lendSchema.index({ idUserBorrower: 1 });
  lendSchema.index({ idUserLender: 1 });
  //lendSchema.index({ item.item_id: 1 });



  // model generation
  export const LendModel = mongooseModel<ILendDoc, ILendModel>('lends', lendSchema);
