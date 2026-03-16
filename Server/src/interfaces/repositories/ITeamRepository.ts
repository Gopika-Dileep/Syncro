import { ITeam } from "../../models/team.model";


export interface ITeamRepository {
    createTeam(name:string,companyId:string):Promise<ITeam>;
    findByCompanyId(companyId:string):Promise<ITeam[]>;
    findByNameAndCompany(name:string,companyId:string):Promise<ITeam |null>
}