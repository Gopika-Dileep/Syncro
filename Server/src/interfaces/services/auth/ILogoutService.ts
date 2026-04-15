export interface ILogoutService {
  execute(refreshToken: string): Promise<void>;
}
