
import { IProject } from "../../models/project.model";
import { ISprint } from "../../models/sprint.model";
import { IBaseRepository } from "./IBaseRepository";



export interface ISprintRepository extends IBaseRepository<ISprint>{
    getSprintsWithPagination(companyId:string,page:number, limit:number , search :string ,status?:string):Promise<{sprints:ISprint[]; total :number}>;
}