import { UserProfileResponseDTO, CompanyProfileDTO, EmployeeProfileDTO } from "../dto/user.dto";

export class UserMapper {
   
    static toUserProfileDTO(user: any, company: any | null, employee: any | null): UserProfileResponseDTO {
        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null,
                created_at: user.createdAt || user.created_at 
            },
            company: company ? this.toCompanyDTO(company) : null,
            employee: employee ? this.toEmployeeDTO(employee) : null
        };
    }


    private static toCompanyDTO(company: any): CompanyProfileDTO {
        return {
            _id: company._id.toString(),
            name: company.name,
            about_us: company.about_us || null
        };
    }

    private static toEmployeeDTO(employee: any): EmployeeProfileDTO {
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


    static toUserUpdateEntity(data: any) {
        return {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
            ...(data.avatar && { avatar: data.avatar })
        };
    }

    static toEmployeeUpdateEntity(data: any) {
        return {
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills })
        };
    }
}
