import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { Types } from "mongoose";
import { IEmployee, IPopulatedEmployee, employeeModel } from "../models/employee.model"

export class EmployeeRepository implements IEmployeeRepository {

    async createEmployee(userId: string, companyId: string, data: Partial<IEmployee>): Promise<IEmployee> {
        return employeeModel.create({ user_id: userId, company_id: companyId, ...data })
    }

    async getEmployeesByCompanyId(companyId: string, page: number, limit: number, search: string): Promise<{ employees: any[], total: number }> {
        const skip = (page - 1) * limit;
        const pipeline: any[] = [
            { $match: { company_id: new Types.ObjectId(companyId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_id'
                }
            },
            { $unwind: '$user_id' }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user_id.name': { $regex: search, $options: 'i' } },
                        { 'user_id.email': { $regex: search, $options: 'i' } },
                        { 'designation': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await employeeModel.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const employees = await employeeModel.aggregate(pipeline);

        return { employees, total };
    }

    async findByUserId(userId: string): Promise<IPopulatedEmployee | null> {
        return employeeModel.findOne({ user_id: userId }).populate("user_id","name email role created_at").populate("company_id", "name").lean() as unknown as IPopulatedEmployee
    }

    async updateEmployee(userId:string,data:Partial<IEmployee>):Promise<IEmployee |null>{
        return await employeeModel.findOneAndUpdate({user_id:userId},{$set:data},{new:true})
    }
}