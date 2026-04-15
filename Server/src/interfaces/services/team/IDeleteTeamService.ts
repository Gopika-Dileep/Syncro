export interface IDeleteTeamService {
  execute(teamId: string): Promise<void>;
}
