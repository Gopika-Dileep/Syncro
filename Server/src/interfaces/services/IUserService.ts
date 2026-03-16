import { ICompany } from "../../models/company.model";
import { IEmployee } from "../../models/employee.model";

export interface IProfileData {
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        created_at: Date;
    };
    company?: ICompany | null;
    employee?: IEmployee | null;
}

export interface IUserService {
    getProfile(userId: string): Promise<IProfileData>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
