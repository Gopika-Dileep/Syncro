export interface IAuthService {
    registration(name:string, email: string,password: string , companyName:string): Promise<{ accessToken:string ,refreshToken:string}>;
    login(email:string,password:string):Promise<{ accessToken:string ,refreshToken:string}>
    refresh(refreshToken:string):Promise<{accessToken:string}>
    logout(refreshToken:string):Promise<void>
    forgotPassword(email:string):Promise<void>
    resetPassword(token:string,newPassword:string):Promise<void>
}
