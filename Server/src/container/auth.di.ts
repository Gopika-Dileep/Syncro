import { AuthController } from "../controller/auth/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../service/auth.service";

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);

export {
    authController
}