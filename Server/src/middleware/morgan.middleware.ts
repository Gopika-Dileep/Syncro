import morgan, { StreamOptions } from 'morgan';
import logger from '../config/logger';

const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

export const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream,
  skip,
});
