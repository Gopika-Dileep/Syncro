import { TeamController } from "../controller/company/team.controller";
import { CompanyRepository } from "../repositories/company.repository";
import { TeamRepository } from "../repositories/team.repository";
import { TeamService } from "../service/team.service";

const teamRepo = new TeamRepository()
const companyRepo = new CompanyRepository()
const teamService = new TeamService(teamRepo , companyRepo)
const teamController = new TeamController(teamService)

export{
    teamController
}