function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`required environment variable ${key} is not configured`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: getEnv('PORT'),
  FRONTEND_URL: getEnv('FRONTEND_URL'),
  MONGO_URI: getEnv('MONGO_URI'),
  ACCESS_TOKEN_SECRET: getEnv('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: getEnv('REFRESH_TOKEN_SECRET'),
  ACCESS_TOKEN_EXPIRY: getEnv('ACCESS_TOKEN_EXPIRY'),
  REFRESH_TOKEN_EXPIRY: getEnv('REFRESH_TOKEN_EXPIRY'),
  REDIS_HOST: getEnv('REDIS_HOST'),
  REDIS_PORT: getEnv('REDIS_PORT'),
  EMAIL_USER: getEnv('EMAIL_USER'),
  EMAIL_PASS: getEnv('EMAIL_PASS'),
  EMAIL_FROM_NAME: getEnv('EMAIL_FROM_NAME'),
  OTP_EXPIRY: Number(getEnv('OTP_EXPIRY')),
  PASSWORD_RESET_EXPIRY: Number(getEnv('PASSWORD_RESET_EXPIRY')),
  BCRYPT_SALT_ROUNDS: Number(getEnv('BCRYPT_SALT_ROUNDS')),
  REFRESH_TOKEN_COOKIE_MAX_AGE: Number(getEnv('REFRESH_TOKEN_COOKIE_MAX_AGE')),
  COOKIE_SECURE: getEnv('COOKIE_SECURE') === 'true',
  COOKIE_SAME_SITE: getEnv('COOKIE_SAME_SITE') as 'lax' | 'strict' | 'none',
  LOG_RETENTION_DAYS: getEnv('LOG_RETENTION_DAYS'),
};
