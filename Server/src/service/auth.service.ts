import bcrypt from 'bcrypt';
import crypto from 'crypto'
import { IAuthService } from '../interfaces/services/IAuthService';
import { IAuthRepository } from '../interfaces/repositories/IAuthRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.utils';
import redis from '../config/redis';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/email.utils';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IPermissionRepository } from '../interfaces/repositories/IPermissionRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';


export class AuthService implements IAuthService {

  constructor(
    private _authRepo: IAuthRepository,
    private _companyRepo: ICompanyRepository,
    private _permissionRepo: IPermissionRepository,
    private _employeeRepo:IEmployeeRepository
  ) { }

  async registration(name: string, email: string, password: string, companyName: string): Promise<{ message: string }> {

    const existing = await this._authRepo.findByEmail(email)
    if (existing) {
      throw new Error("email already exist")
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this._authRepo.createUser(name, email, hashed, "company")

    await this._companyRepo.createCompany(user._id.toString(), companyName)

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log("otp", otp)
    await redis.set(`otp:${email}`, otp, "EX", 600)

    await sendOtpEmail(email, otp)

    return { message: "Otp sent to email successfully" }

  }


  async verifyOtp(email: string, otp: string): Promise<{ accessToken: string, refreshToken: string, user:{id:string , name:string , role:string , designation: string | null , companyName :string |null }, permissions:string[] }> {
    const storedOtp = await redis.get(`otp:${email}`)

    if (!storedOtp || storedOtp !== otp) {
      throw new Error("Invalid or expired OTP")
    }

    const user = await this._authRepo.findByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }

    await this._authRepo.verifyUser(user._id.toString())

    let permissions: string[] = [];
    let designation :string | null = null
    let companyName : string |null = null
    if (user.role === 'employee') {
      const employeeData = await this._employeeRepo.findByUserId(user._id.toString());
      designation = employeeData?.designation || null

      if(employeeData && employeeData.company_id){
        companyName = employeeData.company_id.name
      }
      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString())
    }else{
      const company = await this._companyRepo.findCompanyByUserId(user._id.toString());
      companyName = company?.name || null
    }

    const userPayload ={
      id:user._id.toString(),
      name : user.name,
      role:user.role,
      designation: designation,
      companyName:companyName
    }
    const accessToken = generateAccessToken(userPayload.id,userPayload.role,permissions, userPayload.name,userPayload.designation , userPayload.companyName);
    const refreshToken = generateRefreshToken(userPayload.id)

    await this._authRepo.updateRefreshToken(user._id.toString(), refreshToken)
    await redis.del(`otp:${email}`)
    return { accessToken, refreshToken, user:userPayload, permissions }

  }

  async resendOtp(email: string): Promise<{ message: string; }> {
    const user = await this._authRepo.findByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }
    if (user.is_verified) {
      throw new Error("user is already verified")
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    console.log("otp", otp)
    await redis.set(`otp:${email}`, otp, "EX", 600)

    await sendOtpEmail(email, otp);

    return { message: "new otp send to email" }
  }

  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user:{id:string , name:string , role:string , designation: string | null , companyName :string |null }, permissions:string[] }> {
    const user = await this._authRepo.findByEmail(email)
    if (!user) {
      throw new Error("user not found")
    }

    if (!user.is_verified) {
      throw new Error("User is not verified")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error("Password is wrong")
    }

    let permissions: string[] = [];
    let designation : string |null = null;
    let companyName : string | null = null; 
    if (user.role === 'employee') {
      const employeeData = await this._employeeRepo.findByUserId(user._id.toString())
      designation = employeeData?.designation || null 
      if(employeeData && employeeData.company_id){
        companyName = employeeData.company_id.name
      }

      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString())
    }else{

      const company = await this._companyRepo.findCompanyByUserId(user._id.toString())
      companyName = company?.name || null
    }

    const userPayload ={
      id:user._id.toString(),
      name:user.name,
      role:user.role,
      designation:designation,
      companyName : companyName
    }

    const accessToken = generateAccessToken(userPayload.id,userPayload.role,  permissions, userPayload.name,  userPayload.designation,userPayload.companyName);
    const refreshToken = generateRefreshToken(userPayload.id)

    await this._authRepo.updateRefreshToken(user._id.toString(), refreshToken)
   
    return { accessToken, refreshToken, user:userPayload, permissions }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string, user:{id:string , name:string , role:string , designation: string | null , companyName :string |null }, permissions:string[] }> {
    const decoded = verifyRefreshToken(refreshToken)

    const user = await this._authRepo.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("invalid refresh token")
    }
    let permissions: string[] = [];
    let designation :string |  null = null;
    let companyName :string | null = null;
    if (user.role === 'employee') {

      const employeeData = await this._employeeRepo.findByUserId(user._id.toString());
      designation = employeeData?.designation || null

      if(employeeData && employeeData.company_id){
        companyName = employeeData.company_id.name
      }

      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString())
    }else{
      const company = await this._companyRepo.findCompanyByUserId(user._id.toString())
      companyName = company?.name || null
    }

    const userPayload = {
      id:user._id.toString(),
      name:user.name,
      role:user.role,
      designation:designation,
      companyName:companyName
    }
  
    const accessToken = generateAccessToken(userPayload.id,userPayload.role,permissions,userPayload.name,userPayload.designation,userPayload.companyName)
    return { accessToken, user:userPayload, permissions }
  }

  async logout(refreshToken: string): Promise<void> {
    const decoded = verifyRefreshToken(refreshToken)

    await this._authRepo.clearRefreshToken(decoded.id)
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this._authRepo.findByEmail(email)

    if (!user) {
      throw new Error("User not found")
    }

    const resetToken = crypto.randomBytes(32).toString("hex")

    await redis.set(`password_reset:${resetToken}`, user._id.toString(), "EX", 900)
    await sendPasswordResetEmail(user.email, resetToken)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await redis.get(`password_reset:${token}`)

    if (!userId) {
      throw new Error("Invalid or expired reset token")
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    await this._authRepo.updatePassword(userId, hashed)

    await redis.del(`password_reset:${token}`)
  }
}