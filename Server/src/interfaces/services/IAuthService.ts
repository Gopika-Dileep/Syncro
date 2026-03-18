export interface IAuthService {
    registration(name:string, email: string,password: string , companyName:string): Promise<{message:string}>;
    verifyOtp(email:string,otp:string):Promise<{accessToken:string, refreshToken:string,user:{id:string , name:string , role:string , designation: string | null , companyName :string |null }, permissions:string[]}>
    resendOtp(email: string): Promise<{ message: string }>;
    login(email:string,password:string):Promise<{ accessToken:string ,refreshToken:string,user:{id:string , name:string , role:string , designation: string | null , companyName :string |null },permissions:string[]}>
    refresh(refreshToken:string):Promise<{accessToken:string , user:{id:string , name:string , role:string , designation: string | null , companyName :string |null }, permissions:string[]}>
    logout(refreshToken:string):Promise<void>
    forgotPassword(email:string):Promise<void>
    resetPassword(token:string,newPassword:string):Promise<void>
}
