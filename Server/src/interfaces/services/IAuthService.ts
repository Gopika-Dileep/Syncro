export interface IAuthService {
    registration(name:string, email: string,password: string): Promise<{token:string}>;
    login(email:string,password:string):Promise<{token:string}>
}
