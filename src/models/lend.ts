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
   // id_user: string;  // si l'utilisateur desactive son compte, on met ancien user
   // ask
    item: {item_id: Schema.Types.ObjectId, name: string}; // pour l'historique, celui ci peut apparait donc encore si l'objet n'existe plus
    dateFrom: Date; // ask
    dateTo: Date;
    dateAsk: Date;
    isDamaged: boolean;
    isLate: boolean;
    accepted: {ask: boolean, message: string}; //  ask askOk Out refused history (confirmIn) --> 7 jours après History
    returned: boolean;
    idUserBorrower: { // ask
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    };
    idUserLender: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    };
    // UserBorrower: {user_id: string, contact: string};
    // UserLender: {user_id: string, contact: string};
    message: string;
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
  export const lendSchema = new Schema<ILendDoc>({
    idUserBorrower: {
      type: Schema.Types.ObjectId,
      required: true,
       ref: 'users'
    },
    idUserLender: {
      type: Schema.Types.ObjectId,
      required: true,
       ref: 'users'
    },
    item: { // ask
      item_id: {  // ITEM
        type: Schema.Types.ObjectId,
        required: false,
      },
      name: {  // ITEM
        type: String,
        required: false,
        }
    },
    dateFrom: {
      type: Date,
      required: false,
    },
    dateTo: {
      type: Date,
      required: false, // date to plus grande que date from est-ce qu'on opeut faire un validate à ce point ask
    },
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



  // model generation
  export const LendModel = mongooseModel<ILendDoc, ILendModel>('lends', lendSchema);
