import express, { Express } from 'express';
import * as dotenv from 'dotenv';
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./src/shared/logger"
import { connect } from './src/shared/database/mongoose';
import { UseRoutes } from './src/shared/helpers/routes';
import { router as authRoutes, NAME as authName } from "./src/features/authentication/authRoutes"
import { router as tokenRoutes, NAME as tokenName } from "./src/features/token/tokenRoutes"
import { errorHandler } from './src/shared/middleware/errorHandler';
import { checkCsrf } from './src/shared/middleware/csrf';
dotenv.config();
const app: Express = express();
const port = process.env.PORT;

try {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  connect().then(_ => {
    logger.info("Database connected.");
    app.listen(port, () => {
      logger.info(`⚡️[server]: Server is running on port ${port}`);
    });
  })
  UseRoutes(app, authName, authRoutes);
  UseRoutes(app, tokenName, tokenRoutes);
  app.use(errorHandler);
} catch (error) {
  logger.error(error);
}
