import express, { Express } from 'express';
import * as dotenv from 'dotenv';
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./src/common/logger"
import { connect } from './src/common/mongoose';
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
      logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })

} catch (error) {
  logger.error(error);
}
