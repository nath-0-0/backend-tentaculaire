import {
    Schema,
    Model,
    Document,
    model as mongooseModel
  } from 'mongoose';
import { urlValidator } from '../validators';

  // utilisaer imgur pour stocker lîmage
  // fork sur github pour reprendre un projet


  // main interface
  export interface IItem {
    name: string;
    description: string;
    deposit: number;
    enabled: boolean;
    image: string;
  }

  // document interface, define custom methods here
  // export interface IUserDoc extends Document, IUser {
  export interface IItemDoc extends Document, IItem {

  }

  // model interface, define custom static methods here
  export interface IItemModel extends Model<IItemDoc> {
    search(txt: string, lat: number, long: number, distance: number);
  }

  // schema definition
  export const itemSchema = new Schema<IItemDoc>({
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: 2,
      maxlength: 50
    },
    description: {
      type: String,
      required: false,
      minlength: 0,
      maxlength: 500
    },
    deposit: {
      type: Number,
      required: false,
      min: [0,'Minimum is 0'],
      max: [500,'Maximum is 500'],
    },
    enabled: {  // false si l'utilisateur le met en pause ou si il est en prêt.
      type: Boolean,
      required: true,
      default: true
    },
    image: {
      type: String,
      required: false,
      validate: [urlValidator, 'Image must an uri']
    },
  });


  export const ItemModel = mongooseModel<IItemDoc, IItemModel>('items', itemSchema);


