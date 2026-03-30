import bcrypt from 'bcrypt';
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IUserService } from "../interfaces/services/IUserService";
import { ChangePasswordRequestDTO, UpdateProfileRequestDTO, UserProfileResponseDTO, CompanyProfileDTO, EmployeeProfileDTO } from "../dto/user.dto";

export class UserService implements IUserService {
    constructor(
        private _authRepo: IAuthRepository,
        private _companyRepo: ICompanyRepository,
        private _employeeRepo: IEmployeeRepository
    ) {}

    async getProfile(userId: string): Promise<UserProfileResponseDTO> {
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
            company: company as unknown as CompanyProfileDTO | null,
            employee: employee as unknown as EmployeeProfileDTO | null
        };
    }

    async changePassword(userId: string, data: ChangePasswordRequestDTO): Promise<void> {
        const user = await this._authRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password doesn't match");
        }

        const hashed = await bcrypt.hash(data.newPassword, 10);
        await this._authRepo.updatePassword(userId, hashed);
    }

    async updateUserProfile(userId: string, data: UpdateProfileRequestDTO): Promise<UserProfileResponseDTO> {
        if (data.name || data.email) {
            await this._authRepo.updateUser(userId, { name: data.name, email: data.email });
        }

        const employeeUpdate = {
            phone: data.phone,
            address: data.address,
            skills: data.skills
        };

        await this._employeeRepo.updateEmployee(userId, employeeUpdate);

        return await this.getProfile(userId);
    }
}
