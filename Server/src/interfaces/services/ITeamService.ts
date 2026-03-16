import { ITeam } from "../../models/team.model";


export interface ITeamService {
    createTeam(name:string , userId :string): Promise<ITeam>;
    getTeams(userId:string):Promise<ITeam[]>;
}