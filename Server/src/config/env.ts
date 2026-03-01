function getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`required environment varable ${key} is not configured`);
    }
    return value;
}

export const env = {
    PORT: getEnv('PORT'),
    FRONTEND_URL:getEnv('FRONTEND_URL'),
    MONGO_URI:getEnv('MONGO_URI'),
    ACCESS_TOKEN_SECRET:getEnv("ACCESS_TOKEN_SECRET"),
    REFRESH_TOKEN_SECRET:getEnv("REFRESH_TOKEN_SECRET"),
    REDIS_HOST:getEnv("REDIS_HOST"),
    REDIS_PORT:getEnv("REDIS_PORT"),
    EMAIL_USER: getEnv("EMAIL_USER"),   
    EMAIL_PASS: getEnv("EMAIL_PASS"),   
}