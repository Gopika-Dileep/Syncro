import bcrypt from 'bcrypt';
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IUserService } from "../interfaces/services/IUserService";
import { ChangePasswordRequestDTO, UpdateProfileRequestDTO, UserProfileResponseDTO, CompanyProfileDTO, EmployeeProfileDTO } from "../dto/user.dto";
import { UserMapper } from '../mappers/user.mapper';

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

        return UserMapper.toUserProfileDTO(user, company, employee);
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
        const userUpdate = UserMapper.toUserUpdateEntity(data);
        if (Object.keys(userUpdate).length > 0) {
            await this._authRepo.updateUser(userId, userUpdate);
        }

        const employeeUpdate = UserMapper.toEmployeeUpdateEntity(data);
        if (Object.keys(employeeUpdate).length > 0) {
            await this._employeeRepo.updateEmployee(userId, employeeUpdate);
        }

        return await this.getProfile(userId);
    }
}
