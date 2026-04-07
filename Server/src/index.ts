import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer, Server } from 'http';
dotenv.config();
import App from './app';
import { env } from './config/env';
import { connectDb } from './config/mongoose';
import { connectRedis } from './config/redis';
import logger from './config/logger';

const appinstance = new App();

class serverApp {
  private server: Server;

  constructor() {
    this.server = createServer(appinstance.app);
  }

  public async start(): Promise<void> {
    try {
      await connectDb();
      await connectRedis();
      this.server.listen(env.PORT, () => {
        logger.info(`server is running on port ${env.PORT}`);
      });
    } catch (err) {
      logger.error('Error during startup:', err);
    }
  }
}

new serverApp().start();
