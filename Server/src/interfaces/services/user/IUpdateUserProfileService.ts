import { UpdateProfileRequestDTO, UserProfileResponseDTO } from '../../../dto/user.dto';

export interface IUpdateUserProfileService {
  execute(userId: string, data: UpdateProfileRequestDTO): Promise<UserProfileResponseDTO>;
}
