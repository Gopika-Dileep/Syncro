export interface IToggleBlockEmployeeService {
  execute(userId: string, empUserId: string): Promise<boolean>;
}
