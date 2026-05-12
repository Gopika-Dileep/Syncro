import { injectable, inject } from 'inversify';
import { IAssignTeamToEmployeeService } from '../../interfaces/services/employee/IAssignTeamToEmployeeService';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { NotFoundError, BadRequestError } from '../../errors/AppError';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';

@injectable()
export class AssignTeamToEmployeeService implements IAssignTeamToEmployeeService {
  constructor(@inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository) {}

  async execute(adminUserId: string, employeeId: string, teamId: string): Promise<{ success: boolean; message: string }> {
    const employee = await this._employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);
    if (employee.designation?.toLowerCase().includes('manager')) {
      throw new BadRequestError('Cannot assign managers to a team');
    }

    await this._employeeRepo.updateById(employeeId, { team_id: teamId as unknown as import('mongoose').Types.ObjectId });

    return { success: true, message: 'Employee assigned to team successfully' };
  }
}
