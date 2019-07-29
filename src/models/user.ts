import {
  Schema,
  Model,
  Document,
  model as mongooseModel
} from 'mongoose';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { urlValidator } from '../validators';
import { IItem, itemSchema } from './item';
//coucou

// Schema property alidators

// Schema property setters
/*export const setLuckyNumber = (value: number): number => {
  return Math.floor(Math.abs(value));
};*/


// main interface
export interface IUser {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  avatar: string;
  pseudo :string;
  address:string;
  zip:string;
  state:string;
  country:string;
  
  homeLocation: {
    lat: Number,
    long: Number
  };
  mobileNumber:string;
  favorites: string[];
  items: IItem[];
  lastlogin: number;
  notifications: {
    user_id: string,
    title: string;
    date: Date | number;
    text: string;
  }[]
  // ajoute t'on dans les propriétés la liste des emrpunts/ prets / objet en emrpunt?
}

// document interface, define custom methods here
export interface IUserDoc extends Document, IUser {
  comparePassword(password: string): boolean;
  getToken(): string;
  //modifyPicture();
  addFavorite(idItem:string);
  removeFavorite(idItem:string);
  AddNotification(title:string,date :Date|Number,text :String);
  getNumberFavorite(); // retourne le nbr d'objets en favoris
  getNumberBorrow(); // retourne le nbr d'objets enpruntés
  getNumberLend(); // retourne le nbr d'objets enprumtés
  returnUser(); // retourne un profil public
  getObjectsInBorrow();
  getObjectsInLend();
  getObjectsBorrowed();
  getObjectsLent();

}

// model interface, define custom static methods here
interface IUserModel extends Model<IUserDoc> {
  hashPassword(password: string): string;
}

// schema definition
const userSchema = new Schema<IUserDoc>({
  email: {
    type: String,
    required: true,
    match: /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim
  },
  password: {
    type: String,
    required: true,
    minLength: 59,
    maxLength: 60,
  },
  firstname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  lastname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  address: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 150,
  },
  zip: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 4,
  },
  state: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  country: {
    type: String,
    required: true,
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
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  
  homeLocation: {
    type: {
      lat: {
        type: Number,
        required: true,
      },
      long: {
        type: Number,
        required: true
      }
    },
    required: true,
    default: { lat: 0, long: 0 }
  },
  mobileNumber :{
    type: String,
    require : true,
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
      user_id: {type: String,require:false},
      title: {type: String,require:false,minLength: 2,maxLength: 100},
      date: {type: Number,require:true,default : Date.now},
      text: {type: String,require:false,minLength: 5,maxLength: 200},
    },
  default : [],
  }
});
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ email: 'hashed' });

// Model custom methods
//
// this is an instance IMovieDoc
//
// allow to do:
// const movie = new MovieModel({...});
// movie.setLanguage('Français');
userSchema.method('comparePassword', function (this: IUserDoc, password: string) {
  try {
    return bcrypt.compareSync(password, this.password);
  }
  catch (e) { }
  return false;
});


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

userSchema.method('addFavorite', function (this: IUserDoc, idItem:string) {
  
  throw new Error('not implemented');
});

userSchema.method('removeFavorite', function (this: IUserDoc, idItem:string) {
  
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


// model generation
export const UserModel = mongooseModel<IUserDoc, IUserModel>('users', userSchema);
const toto = new UserModel({});