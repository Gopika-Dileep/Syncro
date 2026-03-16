import { ITeam } from "../../models/team.model";


export interface ITeamService {
    createTeam(name:string , companyId :string): Promise<ITeam>;
    getTeams(companyId:string):Promise<ITeam[]>;
}