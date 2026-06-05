import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IStartSubTaskService } from '../../interfaces/services/subTask/IStartSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { SprintStatus } from '../../enums/SprintEnums';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../errors/AppError';
import { SPRINT_MESSAGES, TASK_MESSAGES } from '../../constants/messages';

@injectable()
export class StartSubTaskService implements IStartSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const actorId = employee?._id ? String(employee._id) : userId;
    const historyEntry: ICreateHistoryInput = {
      action: 'status_change',
      from: 'To Do',
      to: SubTaskStatus.IN_PROGRESS,
      user: actorId,
    };

    const existingSubTask = await this._subTaskRepository.findById(subTaskId);
    if (existingSubTask) {
      const assigneeObj = existingSubTask.assignee_id as unknown as { _id?: { toString(): string } };
      const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : existingSubTask.assignee_id?.toString();

      if (assigneeId !== actorId) {
        throw new ForbiddenError('You can only start work on subtasks assigned to you');
      }

      const sprint = existingSubTask.sprint_id as unknown as { status?: string };
      if (sprint && sprint.status !== SprintStatus.ACTIVE) {
        throw new BadRequestError(SPRINT_MESSAGES.CANNOT_START_INACTIVE_SPRINT);
      }

      const subTask = await this._subTaskRepository.updateWithHistory(
        subTaskId,
        {
          status: SubTaskStatus.IN_PROGRESS,
        },
        historyEntry,
      );

      if (subTask) {
        return SubTaskMapper.toResponseDTO(subTask);
      }
    }

    const existingIssue = await this._issueRepository.findById(subTaskId);
    if (existingIssue) {
      const assigneeObj = existingIssue.assignee_id as unknown as { _id?: { toString(): string } };
      const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : existingIssue.assignee_id?.toString();

      if (assigneeId !== actorId) {
        throw new ForbiddenError('You can only start work on issues assigned to you');
      }

      const sprint = existingIssue.sprint_id as unknown as { status?: string };
      if (sprint && sprint.status !== SprintStatus.ACTIVE) {
        throw new BadRequestError(SPRINT_MESSAGES.CANNOT_START_INACTIVE_SPRINT);
      }

      const issue = await this._issueRepository.updateById(subTaskId, {
        status: 'In Progress',
      });

      if (issue) {
        return SubTaskMapper.fromIssue(issue);
      }
    }

    throw new NotFoundError(TASK_MESSAGES.NOT_FOUND);
  }
}
