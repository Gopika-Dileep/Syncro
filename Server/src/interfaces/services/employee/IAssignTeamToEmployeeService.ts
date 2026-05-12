export interface IAssignTeamToEmployeeService {
  execute(adminUserId: string, employeeId: string, teamId: string): Promise<{ success: boolean; message: string }>;
}
