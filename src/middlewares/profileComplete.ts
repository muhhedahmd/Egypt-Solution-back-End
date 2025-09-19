

import { Request, Response, NextFunction } from "express";

export const requireProfileComplete = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.profileComplete) {
    return res.status(403).json({ error: "Please complete your profile first" });
  }
  next();
};