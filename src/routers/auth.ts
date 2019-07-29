import * as express from 'express';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user';
import { httpError500, httpError400, httpError401 } from '../helpers/http';

export const authRouter = express.Router();

const signinHandler = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Validate missing data
  if (!email || !password)
    return res.status(401).send(httpError401('Email or password are missing'));

  // 2. Get user by email
  UserModel
    .findOne({ email })
    .then(user => {
      // and 3. validate password
      if (!user || !user.comparePassword(password)) {
        res.status(401).send(httpError401('Wrong email or password'));
        return;
      }
      //update lastlogin
      return UserModel.findByIdAndUpdate(
        user._id, // what we update
        { $set :{ lastlogin : Date.now()} }, // update detail
        { new : true, runValidators:true}  // update option : run validation and retiurn modified docuemnt
      )
      // 4. User successfully logged, return user and token
      res.send({ user, token: user.getToken(), error: false });
    })
    .catch(err => res.status(500).send(httpError500(err)));
};
authRouter.post('/signin', signinHandler);

const signupHandler = (req: Request, res: Response) => {
  const newUser: IUser = req.body;
  // 1. Validate missing user data from req.body
  const { email, password, pseudo,firstname,lastname,mobileNumber,address,zip,state,homeLocation } = newUser;
  if (!email || !password || !pseudo|| !mobileNumber|| !address|| !zip || !state ) //homelocation, comment faire?
    return res.status(400).send(httpError400('All fields are required'));

  // 2. Validate uniqueness of email
  UserModel
    .findOne({ email })
    .then(user => {
      if (user) {
        res.status(400).send(httpError400('User already exists'));
        return;
      }
      // 3. Create Model instance using req. body
      const newUserDoc = new UserModel(newUser);
      // 4. Hash password
      newUserDoc.password = UserModel.hashPassword(password);
      // 5. Save and manage validation errors
      return newUserDoc.save();
    })
    .then(user => {
      // 5. Generate user token
      const token = user.getToken();
      // 6. Return complete user object with token
      res.send({ user, error: false, token });
    })
    .catch(err => res.status(500).send(httpError500(err)));
};
authRouter.post('/signup', signupHandler);





//https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/
