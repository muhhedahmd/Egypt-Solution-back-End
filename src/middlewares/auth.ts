import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ServiceError } from "../errors/services.error";
import prisma from "../config/prisma";
import { getRedisClient } from "../config/redis";

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

    const redis = await getRedisClient();
    const cacheKey = `user:${(decoded as any).userId}`;
    let userStr = await redis.get(cacheKey);
    let userData;

    if (userStr) {
      userData = JSON.parse(userStr);
    } else {
      // Cache miss, hit DB
      const dbUser = await prisma.user.findUnique({
        where: { id: (decoded as any).userId },
      });

      if (!dbUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      userData = {
        email: dbUser.email,
        id: dbUser.id,
        // profileId: dbUser,
        role: dbUser.role,
        // profileComplete: dbUser.profileComplete,
      };
      // Cache for 15 minutes
      await redis.set(cacheKey, JSON.stringify(userData), { EX: 900 });
    }

    req.user = userData;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to perform this action",
      });
    }

    next();
  };
};
