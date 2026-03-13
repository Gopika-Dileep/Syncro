import { AuthController } from "../controller/auth/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { AuthService } from "../service/auth.service";

const authRepo = new AuthRepository();
const companyRepo = new CompanyRepository()
const authService = new AuthService(authRepo, companyRepo);
const authController = new AuthController(authService);

export {
    authController
}