import { ChangePasswordRequestDTO, UpdateProfileRequestDTO, UserProfileResponseDTO } from "../../dto/user.dto";

export interface IUserService {
    getProfile(userId: string): Promise<UserProfileResponseDTO>;
    changePassword(userId: string, data: ChangePasswordRequestDTO): Promise<void>;
    updateUserProfile(userId: string, data: UpdateProfileRequestDTO): Promise<UserProfileResponseDTO>;
}
