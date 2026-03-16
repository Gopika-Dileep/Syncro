import { IUser } from "../../models/user.model";

export interface IProfileData {
    user: {
        _id: any;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        created_at: Date;
    };
    company?: any;
    employee?: any;
}

export interface IUserService {
    getProfile(userId: string): Promise<IProfileData>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
