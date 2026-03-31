import { UserProfileResponseDTO, CompanyProfileDTO, EmployeeProfileDTO, UpdateProfileRequestDTO } from "../dto/user.dto";
import { ICompany } from "../models/company.model";
import { IEmployee, IPopulatedEmployee } from "../models/employee.model";
import { IUser } from "../models/user.model";

export class UserMapper {
   
    static toUserProfileDTO(user: IUser, company: ICompany | null, employee: IPopulatedEmployee | null): UserProfileResponseDTO {
        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                created_at: user.created_at 
            },
            company: company ? this.toCompanyDTO(company) : null,
            employee: employee ? this.toEmployeeDTO(employee) : null
        };
    }


    private static toCompanyDTO(company: ICompany): CompanyProfileDTO {
        return {
            _id: company._id.toString(),
            name: company.name,
            about_us: company.about_us || null
        };
    }

    private static toEmployeeDTO(employee: IPopulatedEmployee): EmployeeProfileDTO {
        return {
            _id: employee._id.toString(),
            designation: employee.designation,
            phone: employee.phone,
            address: employee.address,
            skills: employee.skills,
            date_of_joining: employee.date_of_joining ? new Date(employee.date_of_joining).toISOString() : undefined,
            date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth).toISOString() : undefined
        };
    }


    static toUserUpdateEntity(data: Partial<UpdateProfileRequestDTO>) {
        return {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
        };
    }

    static toEmployeeUpdateEntity(data: Partial<UpdateProfileRequestDTO>) {
        return {
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills })
        };
    }
}
