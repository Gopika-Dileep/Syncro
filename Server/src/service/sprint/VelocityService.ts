import { injectable, inject } from 'inversify';
import { IVelocityService } from '../../interfaces/services/sprint/IVelocityService';
import { VelocityAnalyticsResponse, VelocityDataPoint } from '../../dto/sprint.dto';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { TYPES } from '../../di/types';
@injectable()
export class VelocityService implements IVelocityService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.ITeamRepository) private _teamRepository: ITeamRepository,
  ) {}

  async getVelocityAnalytics(sprintId: string): Promise<VelocityAnalyticsResponse> {
    const currentSprint = await this._sprintRepository.findById(sprintId);
    if (!currentSprint) throw new Error('Sprint not found');

    const allSprints = await this._sprintRepository.find({
      company_id: currentSprint.company_id,
    });

    const relevantSprints = allSprints.filter((s) => new Date(s.end_date).getTime() <= new Date(currentSprint.end_date).getTime()).sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

    const sprintWise: VelocityDataPoint[] = [];

    for (const sprint of relevantSprints) {
      const issues = await this._issueRepository.findPopulated({ sprint_id: sprint._id });

      const committed = issues.reduce((acc, issue) => acc + (issue.story_points || 0), 0);
      const completed = issues.filter((issue) => issue.status === 'Done').reduce((acc, issue) => acc + (issue.story_points || 0), 0);

      sprintWise.push({
        sprintName: sprint.name,
        committed,
        completed,
      });
    }

    const teamMap = new Map<string, number>();
    const currentIssues = await this._issueRepository.findPopulated({ sprint_id: sprintId });
    const doneIssues = currentIssues.filter((i) => i.status === 'Done');

    for (const issue of doneIssues) {
      const subTasks = await this._subTaskRepository.find({ issue_id: issue._id });
      const teamsInvolved = new Set<string>();

      for (const st of subTasks) {
        if (st.team_id) {
          const team = await this._teamRepository.findById(st.team_id.toString());
          if (team) teamsInvolved.add(team.name);
        }
      }

      if (teamsInvolved.size === 0) {
        const assignee = issue.assignee_id as unknown as { team_id?: { name: string } };
        if (assignee && assignee.team_id) {
          teamsInvolved.add(assignee.team_id.name || 'Unassigned');
        }
      }

      teamsInvolved.forEach((teamName) => {
        teamMap.set(teamName, (teamMap.get(teamName) || 0) + (issue.story_points || 0));
      });
    }

    const multipleTeam = Array.from(teamMap.entries()).map(([teamName, completed]) => ({
      teamName,
      completed,
    }));

    return {
      sprintWise: sprintWise.slice(-6),
      multipleTeam,
    };
  }
}
