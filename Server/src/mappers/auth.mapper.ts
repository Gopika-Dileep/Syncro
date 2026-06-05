import { AuthResponseDTO, AuthUserDTO } from '../dto/auth.dto';
import { IUser } from '../models/user.model';

export class AuthMapper {
  static toUserDTO(user: IUser, designation: string | null, companyName: string | null, team_id?: string, team?: { _id: string; name: string } | null, employee_id?: string): AuthUserDTO {
    return {
      _id: employee_id || user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      designation: designation,
      companyName: companyName,
      team_id,
      team,
    };
  }

  static toAuthResponseDTO(accessToken: string, refreshToken: string, userDTO: AuthUserDTO, permissions: string[]): AuthResponseDTO {
    return {
      accessToken,
      refreshToken,
      user: userDTO,
      permissions,
    };
  }

  static toRefreshResponseDTO(accessToken: string, userDTO: AuthUserDTO, permissions: string[]): Omit<AuthResponseDTO, 'refreshToken'> {
    return {
      accessToken,
      user: userDTO,
      permissions,
    };
  }

  static toFullAuthResponse(accessToken: string, refreshToken: string, user: IUser, permissions: string[], designation: string | null, companyName: string | null): AuthResponseDTO {
    return {
      accessToken,
      refreshToken,
      user: this.toUserDTO(user, designation, companyName, undefined, null, user._id.toString()),
      permissions,
    };
  }
}
