import { Request, Response } from "express";
import { IUserService } from "../interfaces/services/IUserService";

export class UserController {
    constructor(private _userService: IUserService) {}

    getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const profile = await this._userService.getProfile(userId);
            res.status(200).json({ success: true, data: profile });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to fetch profile";
            res.status(400).json({ success: false, message });
        }
    }

    changePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ success: false, message: "All fields are required" });
                return;
            }

            await this._userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to change password";
            res.status(400).json({ success: false, message });
        }
    }
}
