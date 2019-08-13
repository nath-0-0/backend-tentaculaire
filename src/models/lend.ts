import {
    Schema,
    Model,
    Document,
    model as mongooseModel
  } from 'mongoose';

  // utilisaer imgur pour stocker lîmage
  
  // main interface
  export interface ILend {
   // id_user: string;  // si l'utilisateur desactive son compte, on met ancien user>> je voudrais avoir accès au mail et/numéro tel
   // TOASK
    item: {item_id: Schema.Types.ObjectId, name: string}; // pour l'historique, celui ci peut apparait donc encore si l'objet n'existe plus
    dateFrom: number; // TOASK
    dateTo: number;
    dateAsk: number;
    isDamaged: boolean;
    isLate: boolean;
    accepted: {ask: boolean, message: string}; 
    returned: boolean;
    idUserBorrower: Schema.Types.ObjectId; // TOASK peut être ajouter nom/prénom ainsi qu'info de contact
    idUserLender: Schema.Types.ObjectId;
    // UserBorrower: {user_id: string, contact: string};
    // UserLender: {user_id: string, contact: string};
    message: string; // message pouvant accompagner la demande de prêt
  }

  // document interface, define custom methods here

  export interface ILendDoc extends Document, ILend {
    [x: string]: any; // TOASK pas compris
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
    item: { // TOASK c'est just
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
      required: false, // date to plus grande que date from est-ce qu'on peut faire un validate à ce point ASK
    },                // voir avec compare password TODO TOASK
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
// TOASK pourquoi exporter et des fois non?
  export const LendModel = mongooseModel<ILendDoc, ILendModel>('lends', lendSchema);
