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

    const admin = await this._employeeRepo.findOne({ user_id: adminUserId });
    if (!admin) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);

    const adminCompanyId = admin.company_id?._id ? admin.company_id._id.toString() : admin.company_id?.toString();
    const employeeCompanyId = employee.company_id?._id ? employee.company_id._id.toString() : employee.company_id?.toString();

    if (adminCompanyId !== employeeCompanyId) {
      throw new BadRequestError(EMPLOYEE_MESSAGES.COMPANY_MISMATCH);
    }

    if (employee.designation?.toLowerCase().includes('manager')) {
      throw new BadRequestError(EMPLOYEE_MESSAGES.CANNOT_ASSIGN_MANAGER);
    }

    await this._employeeRepo.updateById(employeeId, { team_id: teamId as unknown as import('mongoose').Types.ObjectId });

    return { success: true, message: EMPLOYEE_MESSAGES.ASSIGN_TEAM_SUCCESS };
  }
}
