import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { IAuthService } from "../../interfaces/services/IAuthService";
import { env } from '../../config/env';

export class AuthService implements IAuthService {
  constructor(private _authRepo: IAuthRepository) { }

  async registration(name: string, email: string, password: string): Promise<{ token: string }> {
    const existing = await this._authRepo.findByEmail(email)
    if (existing) {
      throw new Error("email already exist")
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this._authRepo.create(name, email, hashed)
    const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, { expiresIn: "7d" });
    return { token }
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this._authRepo.findByEmail(email)
    if (!user) {
      throw new Error("user not found")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }
    const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, { expiresIn: "7d" })
    return { token }
  }
}