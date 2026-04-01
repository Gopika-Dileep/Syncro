import { Container } from "inversify";
import { TYPES } from "./types";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../service/auth.service";
import { AuthController } from "../controller/auth.controller";
import { CompanyRepository } from "../repositories/company.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { PermissionRepository } from "../repositories/permission.repository";
import { TeamRepository } from "../repositories/team.repository";
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IPermissionRepository } from "../interfaces/repositories/IPermissionRepository";
import { ITeamRepository } from "../interfaces/repositories/ITeamRepository";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IEmployeeService } from "../interfaces/services/IEmployeeService";
import { ITeamService } from "../interfaces/services/ITeamService";
import { IUserService } from "../interfaces/services/IUserService";
import { EmployeeService } from "../service/employee.service";
import { TeamService } from "../service/team.service";
import { UserService } from "../service/user.service";
import { EmployeeController } from "../controller/employee.controller";
import { TeamController } from "../controller/team.controller";
import { UserController } from "../controller/user.controller";

const container = new Container();

container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
container.bind<ICompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository);
container.bind<IEmployeeRepository>(TYPES.EmployeeRepository).to(EmployeeRepository);
container.bind<IPermissionRepository>(TYPES.PermissionRepository).to(PermissionRepository);
container.bind<ITeamRepository>(TYPES.TeamRepository).to(TeamRepository);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IEmployeeService>(TYPES.EmployeeService).to(EmployeeService);
container.bind<ITeamService>(TYPES.TeamService).to(TeamService);
container.bind<IUserService>(TYPES.UserService).to(UserService);

container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind<EmployeeController>(TYPES.EmployeeController).to(EmployeeController).inSingletonScope();
container.bind<TeamController>(TYPES.TeamController).to(TeamController).inSingletonScope();
container.bind<UserController>(TYPES.UserController).to(UserController).inSingletonScope();

export { container };
