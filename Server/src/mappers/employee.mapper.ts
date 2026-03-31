import { EmployeeResponseDTO, AddEmployeeRequestDTO, UpdateEmployeeRequestDTO } from "../dto/employee.dto";
import { IPopulatedEmployee } from "../models/employee.model";
import { PermissionMapper } from "./permission.mapper";

export class EmployeeMapper {
  
    static toResponseDTO(employee: IPopulatedEmployee, permissionsKeys?: string[]): EmployeeResponseDTO {
        return {
            _id: employee._id.toString(),
            user_id: {
                _id: employee.user_id?._id?.toString() || employee.user_id?.toString(),
                name: employee.user_id?.name || "",
                email: employee.user_id?.email || "",
                role: employee.user_id?.role || "",
                avatar: employee.user_id?.avatar,
                is_blocked: employee.user_id?.is_blocked || false
            },
            company_id: {
                _id: employee.company_id?._id?.toString() || employee.company_id?.toString(),
                name: employee.company_id?.name || ""
            },
            team_id: employee.team_id?._id?.toString() || employee.team_id?.toString(),
            designation: employee.designation,
            phone: employee.phone,
            address: employee.address,
            skills: employee.skills,
            date_of_joining: employee.date_of_joining ? new Date(employee.date_of_joining).toISOString() : undefined,
            date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth).toISOString() : undefined,
            permissions: permissionsKeys ? PermissionMapper.toStructured(permissionsKeys) : undefined,
            created_at: employee.created_at ? new Date(employee.created_at).toISOString() : ""
        };
    }


    static toResponseList(employees: IPopulatedEmployee[]): EmployeeResponseDTO[] {
        return employees.map(emp => this.toResponseDTO(emp));
    }


    static toCreateEntity(data: AddEmployeeRequestDTO, joiningDate?: Date | null, dateOfBirth?: Date | null) {
        return {
            ...(data.designation && { designation: data.designation }),
            ...(joiningDate && { date_of_joining: joiningDate }),
            ...(dateOfBirth && { date_of_birth: dateOfBirth }),
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills }),
        };
    }

    static toUpdateEntity(data: UpdateEmployeeRequestDTO, joiningDate?: Date | null, dateOfBirth?: Date | null) {
        return {
            ...(data.designation && { designation: data.designation }),
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills }),
            ...(joiningDate && { date_of_joining: joiningDate }),
            ...(dateOfBirth && { date_of_birth: dateOfBirth }),
        };
    }
}
