import { injectable, inject } from 'inversify';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetSprintsService } from '../../interfaces/services/sprint/IGetSprintsService';
import { GetSprintRequestDTO, PaginatedSprintResponseDTO } from '../../dto/sprint.dto';
import { SprintMapper } from '../../mappers/sprint.mapper';
import { TYPES } from '../../di/types';
import { SPRINT_MESSAGES, PROJECT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class GetSprintsService implements IGetSprintsService {
  constructor(
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.IIssueRepository) private _issueRepo: IIssueRepository,
  ) {}

  async execute(userId: string, query: GetSprintRequestDTO): Promise<{ message: string; data: PaginatedSprintResponseDTO }> {
    const { page, limit, search, status } = query;

    const employee = await this._employeeRepo.findByUserId(userId);
    const companyId: string = String(employee?.company_id._id || employee?.company_id);
    
    if (!companyId) throw new NotFoundError(PROJECT_MESSAGES.COMPANY_CONTEXT_NOT_FOUND);

    const { sprints, total } = await this._sprintRepository.getSprintsWithPagination(
        companyId, 
        page, 
        limit, 
        search, 
        status
    );

    // Fetch story points commitment and item count for these sprints
    const sprintIds = sprints.map(s => s._id.toString());
    const issues = await this._issueRepo.findAllBySprintIds(sprintIds);

    // Group points and counts by sprintId
    const statsMap = issues.reduce((acc, issue) => {
        const sid = issue.sprint_id?.toString();
        if (sid) {
            if (!acc[sid]) acc[sid] = { points: 0, count: 0, completed: 0 };
            acc[sid].points += (issue.story_points || 0);
            acc[sid].count += 1;
            if (issue.status === 'Done') {
                acc[sid].completed += (issue.story_points || 0);
            }
        }
        return acc;
    }, {} as Record<string, { points: number, count: number, completed: number }>);

    return {
      message: SPRINT_MESSAGES.FETCH_SUCCESS,
      data: {
        sprints: sprints.map(s => {
            const stats = statsMap[s._id.toString()] || { points: 0, count: 0, completed: 0 };
            return SprintMapper.toResponseDTO(s, stats.points, stats.count, stats.completed);
        }),
        total,
      },
    };
  }
}