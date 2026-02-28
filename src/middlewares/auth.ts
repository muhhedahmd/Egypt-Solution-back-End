import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ServiceError } from "../errors/services.error";
import prisma from "../config/prisma";

export class AuthError extends ServiceError {
  constructor(
    message: string = "Access denied. Authentication required.",
    code: string = "AUTH_UNAUTHORIZED",
    statusCode: number = 401,
  ) {
    super(message, statusCode, code);
    this.name = "AuthError";
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new AuthError();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "string") throw new AuthError();

    req.user = {
      email: decoded.email,
      id: decoded.userId,
      profileId: decoded.profileId,
      role: decoded.role,
      profileComplete: decoded.profileComplete,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuthv2 = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies.accessToken || req.cookies["__Secure-accessToken"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "string")
      return res.status(401).json({ error: "Unauthorized" });

    // Trust the JWT payload — it's signed by us, no need to hit DB on every request
    if (decoded.role !== "ADMIN")
      return res.status(401).json({ error: "you do not have permission" });

    req.user = {
      email: decoded.email,
      id: decoded.userId,
      profileId: decoded.profileId,
      role: decoded.role,
      profileComplete: decoded.profileComplete,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
