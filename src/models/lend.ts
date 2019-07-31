import {
    Schema,
    Model,
    Document,
    model as mongooseModel
  } from 'mongoose';
// import { ItemModel } from './conversation';
import { itemSchema } from './item';

  // utilisaer imgur pour stocker lîmage
  // fork sur github pour reprendre un projet



  // main interface
  export interface ILend {
   // id_user: string;  // si l'utilisateur desactive son compte, on met ancien user
    item: {item_id: string, title: string}; // pour l'historique, celui ci peut apparait donc encore si l'objet n'existe plus
    dateFrom: number;
    dateTo: number;
    rating: number;
    isDamaged: boolean;
    isLate: boolean;
    accepted: {ask: boolean, message: string}; //  ask askOk Out refused history (confirmIn) --> 7 jours après History
    returned: boolean;
    borrower: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    };
    lender: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    };
  }



  // document interface, define custom methods here
  // export interface IUserDoc extends Document, IUser {

  export interface ILendDoc extends Document, ILend {
  }

  // model interface, define custom static methods here
  interface ILendModel extends Model<ILendDoc> {
  }

  // schema definition
  export const lendSchema = new Schema<ILendDoc>({
    iduserborrower: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    },
    Item: {
      type: itemSchema,
      required: true,
    },
    dateFrom: {
      type: Number,
      required: true,
    },
    dateTo: {
      type: Number,
      required: true, // date to plus grande que date from
    },
   ratingState: {
      type: Boolean,
      required: false,
    },
    ratingDelay: {
      type: Boolean,
      required: false,
    },
    status: {
      type: String,
      required: false,
    }
  });



  // model generation
  export const LendModel = mongooseModel<ILendDoc, ILendModel>('lends', lendSchema);
