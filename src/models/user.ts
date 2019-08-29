import {
  Schema,
  Model,
  Document,
  Types,
  model as mongooseModel
} from 'mongoose';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IItem, itemSchema } from './item';


// main interface
export interface IUser {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  avatar: string;
  pseudo: string;
  tel: string;
  address: string;
  zip: string;
  state: string;
  country: string;
  homeLocation: {
    type: string; coordinates: [number]
  };
  mobileNumber: string;
  favorites: string[];
  items: IItem[]; // mettre any
  lastlogin: number;
  notifications: {
    lend_id: string,
    title: string;
    date: Date | number;
    text: string;
    contactNotif: string;
  }[];
}


// document interface, define custom methods here
export interface IUserDoc extends Document, IUser {
  comparePassword(password: string): boolean;
  getToken(): string;
  addFavorite(idItem: string, res: Response);
  removeFavorite(idItem: string);
  removeItem(item_id: Types.ObjectId);

}
// statics
interface IUserModel extends Model<IUserDoc> {
  hashPassword(password: string): string;
  findByCoordinates(coordinates, maxDistance,txt);
  addItem(user_id: Schema.Types.ObjectId, item: IItem);
  addNotification(user_id: Schema.Types.ObjectId, notif: Object);

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
    minLength: 59,
    maxLength: 60,
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
    required: false,
    default: 'https://i.imgur.com/9HJtn5y.png',
    //validate: [urlValidator, 'Avatar must an uri']
  },
  pseudo: {
    type: String,
    required: false,
    minLength: 2,
    maxLength: 100,
  },
  tel: {
    type: String,
    required: false,
    minLength: 7,
    maxLength: 20,
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
    type: [itemSchema], // !!! <-- array type definition - String[] wont compile ASK ASKfonvtionne pas bien
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
      lend_id : [String],
      title: {type: String, require: false, minLength: 2, maxLength: 100},
      date: {type: Number, require: true, default : Date.now},
      text: {type: String, require: false, minLength: 5, maxLength: 200},
      contactNotif : {type: String, require: false, minLength: 5, maxLength: 500} // TODO V2
    },
    default : [],
  }
});

// On crée l'index pour $geoNear
userSchema.index({ 'homeLocation': '2dsphere' });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ pseudo: 1 }, { unique: true });

// methode
userSchema.method('comparePassword', function (this: IUserDoc, password: string) {
  try {
    return bcrypt.compareSync(password, this.password);
  }
  catch (e) { }
  return false;
});


userSchema.method('getToken', function (this: IUserDoc) {
  const user = this.toObject();
  delete user.password;
  return jwt.sign({ user },
    process.env.JWT_SECRET, {
   // expiresIn: process.env.JWT_EXPIRE  //TOASK TODO cela ne fonctionne pas avec
  });
});

// override toJSON to remove password before sending response
userSchema.method('toJSON', function (this: IUserDoc) {
  const user = this.toObject();
  delete user.password;
  return user;
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
userSchema.static('hashPassword', (password: string): string => {
  return bcrypt.hashSync(password, +process.env.BCRYPT_ROUNDS);
});

userSchema.static('addItem', (user_id: Schema.Types.ObjectId, item: IItem) => {
  // tslint:disable-next-line: no-use-before-declare
  return UserModel.findByIdAndUpdate(
    user_id, // ObjectId(user_id)
    { $push: { items: item } },
    { new: true, runValidators: true, strict: true }
  );
});

userSchema.static('addNotification', (user_id: Schema.Types.ObjectId, notif: Object) => {
  // tslint:disable-next-line: no-use-before-declare
  return UserModel.findByIdAndUpdate(
    user_id, // ObjectId(user_id)
    { $push: { notifications: notif } },
    { new: true, runValidators: true, strict: true }
  );
});


userSchema.static('findByCoordinates', (coordinates: [Number], maxDistance: number, txt: String) => {

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
        },
        {$match : {'items.name': {'$regex' : txt, '$options' : 'i'}}},
        ]
      );
    });

export const UserModel = mongooseModel<IUserDoc, IUserModel>('users', userSchema);

