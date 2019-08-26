import {
    Schema,
    Model,
    Document,
    model as mongooseModel
  } from 'mongoose';


  // main interface
  export interface ILend {
    item: {item_id: Schema.Types.ObjectId, name: string}; // pour l'historique, celui ci peut apparait donc encore si l'objet n'existe plus
    dateFrom: number; // TOASK
    dateTo: number;
    dateAsk: number;
    isDamaged: boolean;
    isLate: boolean;
    accepted: {ask: boolean, message: string}; 
    returned: boolean;
    idUserBorrower: Schema.Types.ObjectId;
    idUserLender: Schema.Types.ObjectId;
    message: string; // message pouvant accompagner la demande de prêt
  }

  // document interface, define custom methods here
  export interface ILendDoc extends Document, ILend {
   // [x: string]: any; // TOASK pas compris
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
       ref: 'users',
    },
    idUserLender: {
      type: Schema.Types.ObjectId,
      required: true,
       ref: 'users',
    },
    item: {
      item_id: {  // ITEM
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'users.items',
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
      required: false, // TODO ajouter validation dans schema dateTO plus grande que dateFrom dateFrom > aujourd'hui
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

  lendSchema.index({ idUserBorrower: 1 });
  lendSchema.index({ idUserLender: 1 });

// model generation
  export const LendModel = mongooseModel<ILendDoc, ILendModel>('lends', lendSchema);
