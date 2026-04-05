import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: string, role: string, permissions: string[] = [], name: string, designation: string | null, companyName: string | null) => {
  return jwt.sign({ id: userId, role, permissions, name, designation, companyName }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as any,
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY as any });
};

export const verifyAccessToken = (token: string): { id: string; role: string; permissions: string[] } => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { id: string; role: string; permissions: string[] };
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };
};
