import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as cors from 'cors';
import * as compress from 'compression';
import * as cookieParser from 'cookie-parser';
import { authRouter, rootRouter, userRouter, itemRouter, lendRouter } from './routers';
// bimport * from './routers/index';
import * as dotenv from 'dotenv';
import { notFoundMiddleware, errorMiddleware } from './middlewares/error';

import { Database } from './database';

// load .env variables into process.env
dotenv.config();



const PORT = +process.env.PORT || +process.env.EXPRESS_PORT;
const HOST = process.env.HOST || process.env.EXPRESS_HOST;

const MONGO_URI = process.env.MONGO_URI;
const database: Database = new Database(MONGO_URI);

database
  .connect()
  .then(_ => {
    // APP
    const app = express();

    // MIDDLEWARES
    // use bodyParser to parse json
    //app.use(bodyParser.json())
    app.use(bodyParser.json({ limit: '40MB' }))
      // use Helmet to help secure Express apps with various HTTP headers
      .use(helmet())
      // use morgan to log requests to the console
      .use(morgan('dev'))
      // use HPP to protect against HTTP Parameter Pollution attacks
      .use(hpp())
      // enable gzip compression
      //.use(compress())
      // cors domaine originZ
      .use(cors({ origin: 'http://localhost:8100', optionsSuccessStatus: 200 }))
     // .use(cors())
      // .use(cors({ 
      //   optionsSuccessStatus: 200,
      //   origin: (ori, cb) => { cb(null, true) }
      //   }))
      // parse cookies
      .use(cookieParser());


    // ROUTES
    const apiRouter = express.Router();
    app.use('/api/v1', apiRouter);

    apiRouter.use('/', rootRouter);

    // // auth routes
    apiRouter.use('/auth', authRouter);
    apiRouter.use('/item', itemRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/lend', lendRouter);

    // other routes
    // apiRouter.use('/user', userRouter);
    // ...


    // HTTP REQUEST ERRORS
    app.use(errorMiddleware)
      .use(notFoundMiddleware);

    // RUN EXPRESS SERVER
    const server = app.listen(PORT, HOST);

    // PROCESS EVENTS
    // gracefully stop the server in case of SIGINT (Ctrl + C) or SIGTERM (Process stopped)
    const closeServer = () => {
      console.log('close express server');
      server.close();
      // manager database connection
      console.log('disconnect mongo');
      return database.disconnect();
    };

    // EXPRESS SERVER ERRORS
    server.on('error', (err: any) => {
      switch (err.code) {
        case 'EACCES':
          console.error(`${HOST}:${PORT} requires elevated privileges`);
          break;
        case 'EADDRINUSE':
          console.error(`${HOST}:${PORT} is already in use`);
          break;
        default:
          console.error('Error connecting ' + err);
          break;
      }
      closeServer()
        .then(_ => process.exit(1))
        .catch(_ => process.exit(1));
    });
    server.on('listening', () => {
      console.log(`Server listening on ${HOST}:${PORT}`);
    });



    process.on('SIGTERM', closeServer);
    process.on('SIGINT', closeServer);

  })
  .catch(err => {
    console.error('Database connection error');
    console.error(err);
    process.exit(1);
  });
