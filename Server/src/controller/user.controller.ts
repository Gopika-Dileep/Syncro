import { Request, Response } from "express";
import { IUserService } from "../interfaces/services/IUserService";
import { HttpStatus } from "../enums/HttpStatus";
import { USER_MESSAGES } from "../constants/messages";

export class UserController {
    constructor(private _userService: IUserService) {}

    getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: USER_MESSAGES.PROFILE_FETCH_FAILED });
                return;
            }

            const profile = await this._userService.getProfile(userId);
            res.status(HttpStatus.OK).json({ success: true, data: profile });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : USER_MESSAGES.PROFILE_FETCH_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    changePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: USER_MESSAGES.PASSWORD_CHANGE_FAILED });
                return;
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: USER_MESSAGES.ALL_FIELDS_REQUIRED });
                return;
            }

            await this._userService.changePassword(userId, currentPassword, newPassword);
            res.status(HttpStatus.OK).json({ success: true, message: USER_MESSAGES.PASSWORD_CHANGE_SUCCESS });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : USER_MESSAGES.PASSWORD_CHANGE_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    updateProfile = async (req:Request , res:Response) :Promise<void> =>{
        try{
            const userId = req.userId

            const {name,email,phone,address,skills} = req.body

            if(!userId){
                res.status(HttpStatus.UNAUTHORIZED).json({success:false ,message: USER_MESSAGES.PROFILE_UPDATE_FAILED});
                return 
            }

            const result = await this._userService.updateUserProfile(userId,{name,email,phone,address,skills});

            res.status(HttpStatus.OK).json({success:true ,message: USER_MESSAGES.PROFILE_UPDATE_SUCCESS, data:result});
        }catch (err:unknown){
           const message = err instanceof Error ? err.message : USER_MESSAGES.PROFILE_UPDATE_FAILED;
           res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }
}
