import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";



export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decoded === 'string') return res.status(401).json({ error: 'Unauthorized' });
        
        req.user = {
            email: decoded.email,
            id: decoded.userId,
            profileId : decoded.profileId,
            role: decoded.role,
            profileComplete: decoded.profileComplete
        };
        
        
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'Unauthorized' });

    }
    // next();
}
export const requireAuthv2 = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.cookies.accessToken;
        console.log(token , "token")
        if (!token) {

            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decoded === 'string') return res.status(401).json({ error: 'Unauthorized' });
        
        req.user = {
            email: decoded.email,
            id: decoded.userId,
            profileId : decoded.profileId,
            role: decoded.role,
            profileComplete: decoded.profileComplete
        };
        
        
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'Unauthorized' });

    }
    // next();
}