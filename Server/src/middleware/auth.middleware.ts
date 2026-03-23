import { verifyAccessToken } from "../utils/token.utils"
import { Request, Response, NextFunction } from "express"
import { userModel } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: string;
            permissions?: string[];
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ success: false, message: "NO token provided" })
            return
        }
        const token = authHeader.split(" ")[1]
        if (!token) return

        const decoded = verifyAccessToken(token)

        const user = await userModel.findById(decoded.id).select('is_blocked');
        if (!user || user.is_blocked) {
             res.status(403).json({ success: false, message: "Account is blocked. Access denied." });
             return;
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.permissions = decoded.permissions || [];
        next()
    } catch {
        res.status(401).json({ success: false, message: "invalid or expired token " })
    }
}