import { Request, Response } from 'express';
import { env } from '../config/env';

export const cookieUtils = {
    setRefreshToken: (res: Response, token: string): void => {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: env.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });
    },

    getRefreshToken: (req: Request): string | undefined => {
        return req.cookies?.refreshToken as string | undefined;
    },

    clearRefreshToken: (res: Response): void => {
        res.clearCookie('refreshToken');
    },
};
