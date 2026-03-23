import axiosInstance from "./axiosinstance";


export interface UserProfile {
    user:{
        _id: string;
        name:string;
        email:string;
        role:string;
        avatar?:string;
        created_at:string;
    };
    company?:{
        name:string;
        about_us?:string;
    } | null;
    employee?:{
        designation ? : string;
        phone?:string;
        address?:string;
        skills?:string[];
        date_of_joining?:string;
        team?: { _id: string; name: string } | null; 
    } | null;
}


export const getProfileApi = async () : Promise <UserProfile> =>{
    const response = await axiosInstance.get("/user/profile");
    return response.data.data;  //{full profile data will be sent}
};

export const changePasswordAPi = async (data:{currentPassword:string;newPassword:string}):Promise<{success:boolean; message:string}>=>{
     const response = await axiosInstance.post('/user/change-password',data);
     return response.data; // update password , {no returns doesnt even return success message} // just check that 
}

export const updateProfileApi = async (data:{name:string,email:string,phone?:string;address?:string; skills:string[]}):Promise<{success:boolean ; message:string}>=>{
    const response = await axiosInstance.put("/user/profile",data);
    return response.data;
}
