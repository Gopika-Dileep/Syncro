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
    JWT_SECRET:getEnv("JWT_SECRET")
}