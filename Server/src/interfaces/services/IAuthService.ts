export interface IAuthService {
    registration(name:string, email: string,password: string , companyName:string): Promise<{message:string}>;
    verifyOtp(email:string,otp:string):Promise<{accessToken:string, refreshToken:string,role:string,permissions:string[]}>
    resendOtp(email: string): Promise<{ message: string }>;
    login(email:string,password:string):Promise<{ accessToken:string ,refreshToken:string,role:string,permissions:string[]}>
    refresh(refreshToken:string):Promise<{accessToken:string , role:string , permissions:string[]}>
    logout(refreshToken:string):Promise<void>
    forgotPassword(email:string):Promise<void>
    resetPassword(token:string,newPassword:string):Promise<void>
}
