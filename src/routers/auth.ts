import * as express from 'express';
import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import {
  httpError400,
  httpError401,
  mongoError
} from '../helpers/http';
import { authMiddleware } from '../middlewares/auth';

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
      // 4. Update lastLogin
      return UserModel.findByIdAndUpdate(
        user._id, // what we update
        { $set: { lastLogin: Date.now() } }, // update details
        { new: true, runValidators: true } // update options: run validations and return modified document
      )
      // 5. User successfully logged, return user and token
      .then(user => res.send({ user, token: user.getToken(), error: false }));
    })
    .catch(err => mongoError(err, res));
};
authRouter.post('/signin', signinHandler);


const signupHandler = (req: Request, res: Response) => {
  // 1. Validate missing user data from req.body
  const { email, password} = req.body;
  if (!email || !password )
    return res.status(400).send(httpError400('Email and password are required'));

  // 2. Validate uniqueness of email
  UserModel
    .findOne({ email })
    .then(user => {
      if (user) {
        res.status(400).send(httpError400('User already exists'));
        return;
      }
      // 3. Create Model instance using req. body
      const newUser = new UserModel(req.body);
      // 4. Hash password
      newUser.password = UserModel.hashPassword(password);
      // 5. Save and manage validation errors

      return newUser.save();
    })
    .then(user => {
      // 5. Generate user token
      const token = user.getToken();
      // 6. Return complete user object with token
      res.send({ user, error: false, token });
    })
    .catch(err => mongoError(err, res));
};
authRouter.post('/signup', signupHandler);

// const whoIAmHandler = (req: Request & { tokenContent?: any }, res: Response) => {
//   console.log('token exist...');
//   // 1. get user from token
//   const user = req.tokenContent.user;
//   // 2.
//   res.status(400).send({ user });
// };

authRouter.get('/whoiam', [authMiddleware], (req: Request & { tokenContent?: any }, res: Response) => {
  console.log('token exist...');
  // 1. get user from token
  const {user = null} = req.tokenContent || {};
  res.status(400).send({ user });
});


// https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/
