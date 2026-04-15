import { UserProfileResponseDTO } from '../../../dto/user.dto';

export interface IGetProfileService {
  execute(userId: string): Promise<UserProfileResponseDTO>;
}
