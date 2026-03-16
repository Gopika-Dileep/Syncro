import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { ITeamRepository } from "../interfaces/repositories/ITeamRepository";
import { ITeamService } from "../interfaces/services/ITeamService";
import { ITeam } from "../models/team.model";



export class TeamService implements ITeamService{
    constructor(
        private _teamRepo:ITeamRepository,
        private _companyRepo:ICompanyRepository
    ) {}

    async createTeam(name: string, userId: string): Promise<ITeam> {
        
        const company = await this._companyRepo.findCompanyByUserId(userId);

        if(!company){
            throw new Error("company not found")
        }

        const resolvedCompanyId = company._id.toString();
        const existing = await this._teamRepo.findByNameAndCompany(name,resolvedCompanyId);

        if(existing){
            throw new Error("this team already exisits");
        }

        return await this._teamRepo.createTeam(name,resolvedCompanyId);
    }

    async getTeams(userId:string):Promise<ITeam[]>{
        const company = await this._companyRepo.findCompanyByUserId(userId)
        if(!company) throw new Error("company not found");

        return await this._teamRepo.findByCompanyId(company._id.toString())
    }
}