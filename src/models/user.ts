import {
  Schema,
  Model,
  Document,
  Types,
  model as mongooseModel
} from 'mongoose';



import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { urlValidator } from '../validators';
import { IItem, itemSchema } from './item';
// import { Request, Response } from 'express';
// import * as express from 'express';
// import { lendSchema } from './lend';

// coucou

// Schema property alidators
export const validateAvatar = (avatar: string): boolean => {
  return avatar.startsWith('http://') || avatar.startsWith('https://');
};

// main interface
export interface IUser {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  avatar: string;
  pseudo: string;
  address: string;
  zip: string;
  state: string;
  country: string;
  /*homeLocation: {
    lat: Number,
    long: Number
  };*/
  homeLocation: {
    type: string; coordinates: [number]
  };
  mobileNumber: string;
  favorites: string[];
  items: IItem[];
  lastlogin: number;
  notifications: {
    user_id: string,
    title: string;
    date: Date | number;
    text: string;
  }[];
  // ajoute t'on dans les propriétés la liste des emrpunts/ prets / objet en emrpunt?
}


// document interface, define custom methods here
export interface IUserDoc extends Document, IUser {
  comparePassword(password: string): boolean;
  getToken(): string;
  // modifyPicture();
  /*
  addNotification(title: string, date: Date|Number, text: String);
  getNumberFavorite(); // retourne le nbr d'objets en favoris
  getNumberBorrowed(); // retourne le nbr d'objets enpruntés
  getNumberLent(); // retourne le nbr d'objets enprumtés
  returnUser(); // retourne un profil public
  getObjectsCurrentlyBorrow();
  getObjectsCurrentlyLend();
  getObjectsBorrowed();
  getObjectsLent();
  */

  addFavorite(idItem: string, res: Response);
  removeFavorite(idItem: string);
  removeItem(item_id: Types.ObjectId);

}
interface IUserModel extends Model<IUserDoc> {
  hashPassword(password: string): string;
  findByCoordinates(coordinates, maxDistance);
  addItem(user_id: Types.ObjectId, item: IItem);
}

// schema definition
export const userSchema = new Schema<IUserDoc>({
  email: {
    type: String,
    required: true,
    match: /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim
  },
  password: {
    type: String,
    required: true,
  //  minLength: 59,
  //  maxLength: 60,
  },
  firstname: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 100,
  },
  lastname: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 100,
  },
  address: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 150,
  },
  zip: {
    type: String,
    required: false,
    minLength: 4,
    maxLength: 4,
  },
  state: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 100,
  },
  country: {
    type: String,
    required: true,
    default: 'Suisse',
    minLength: 2,
    maxLength: 100,
  },
  avatar: {
    type: String,
    required: true,
    default: 'https://www.gravatar.com/avatar/default',
    validate: [urlValidator, 'Avatar must an uri']
  },
  pseudo: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 100,
  },
   homeLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    require : false,
  },
  mobileNumber : {
    type: String,
    require : false,
    match : '/^(\+41|0041|0){1}(\(0\))?[0-9]{9}$/'
  },
  favorite: {
    type: [String], // !!! <-- array type definition - String[] wont compile
    required: false,
    default: []
  },
  items: {
    type: [itemSchema],
    require : true,
    default : []
  },
  lastLogin: {
    type: Number,
    required: true,
    default: Date.now
  },
  notifications: {
    type : {
      user_id: {type: String, require: false},
      // title: {type: String, require: false, minLength: 2, maxLength: 100},
      date: {type: Number, require: true, default : Date.now},
      text: {type: String, require: false, minLength: 5, maxLength: 200},
      typeNotif: {type: String, require: false, minLength: 5, maxLength: 100},
      // contactNotif : {type: String, require: false, minLength: 5, maxLength: 100}
    },
    default : [],
  }
});

// On crée l'index pour $geoNear
userSchema.index({ 'homeLocation': '2dsphere' });
// userSchema.index({ 'homeLocation': '2dsphere' });
userSchema.index({ email: 1 }, { unique: true });

// model generation

// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ email: 'hashed' });

// Model custom methods
//
// this is an instance IMovieDoc
//
// allow to do:
// const movie = new MovieModel({...});
// movie.setLanguage('Français');
/*userSchema.method('comparePassword', function (this: IUserDoc, password: string) {
  try {
    return bcrypt.compareSync(password, this.password);
  }
  catch (e) { }
  return false;
});*/




userSchema.method('getToken', function (this: IUserDoc) {
  return jwt.sign({
      userId: this._id.toString()
    },
    process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
});

// override toJSON to remove password before sending response
userSchema.method('toJSON', function (this: IUserDoc) {
  const obj = this.toObject();
  delete obj.password;
  return obj;
});

userSchema.method('addFavorite', function (this: IUserDoc, idItem: string) {

  throw new Error('not implemented');
});

userSchema.method('removeFavorite', function (this: IUserDoc, idItem: string) {

  throw new Error('not implemented');
});

userSchema.method('removeItem', function (item_id: Types.ObjectId) {

  throw new Error('not implemented');
});
// Model custom static methods
//
// cannot use this here
//
// allow to do:
// MovieModel.staticMethod();
userSchema.static('hashPassword', (password: string): string => {
  return bcrypt.hashSync(password, +process.env.BCRYPT_ROUNDS);
});

userSchema.static('addItem', (user_id: Types.ObjectId, item: IItem) => {
  // tslint:disable-next-line: no-use-before-declare
  return UserModel.findByIdAndUpdate(
    user_id, // ObjectId(user_id)
    {  $push: { items: item } },
    // { $push: [{name: 'tondeuse', description: 'pour petite parcelle', deposit: 20, enabled: true }] }, // update detail
    { new: true, runValidators: true, strict: true }
  );
});

userSchema.static('addNotification ', (borrower_id: Types.ObjectId, lender_id: Types.ObjectId, typeNotif: String, txt: String) => {
  // tslint:disable-next-line: no-use-before-declare
  return UserModel.findByIdAndUpdate(
    lender_id, // ObjectId(user_id)
    {  $push: { notifications: {
      user_id : borrower_id,
      text : txt,
      typeNotif: typeNotif
    } } },
    // { $push: [{name: 'tondeuse', description: 'pour petite parcelle', deposit: 20, enabled: true }] }, // update detail
    { new: true, runValidators: true, strict: true }
  );
});

// u serSchema.statics.findByCoordinates = function(coordinates, maxDistance) {
  userSchema.static('findByCoordinates', (coordinates: [Number], maxDistance: number) => {
    // throw new Error('not implemented');

    return UserModel.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: coordinates
            },
            maxDistance: maxDistance,
            distanceField: 'dist.calculated',
            spherical: false
          }
        }
        ]
      );
    });

export const UserModel = mongooseModel<IUserDoc, IUserModel>('users', userSchema);

