import bcrypt from 'bcrypt';
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IUserService, IProfileData } from "../interfaces/services/IUserService";

export class UserService implements IUserService {
    constructor(
        private _authRepo: IAuthRepository,
        private _companyRepo: ICompanyRepository,
        private _employeeRepo: IEmployeeRepository
    ) {}

    async getProfile(userId: string): Promise<IProfileData> {
        const user = await this._authRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        let company = null;
        let employee = null;

        if (user.role === 'company') {
            company = await this._companyRepo.findCompanyByUserId(userId);
        } else if (user.role === 'employee') {
            employee = await this._employeeRepo.findByUserId(userId);
        }

        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                created_at: user.created_at
            },
            company,
            employee
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this._authRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password doesn't match");
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await this._authRepo.updatePassword(userId, hashed);
    }
}
