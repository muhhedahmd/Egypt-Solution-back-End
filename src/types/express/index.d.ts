import { User } from "../../models/User"; // أو من Prisma لو بتستخدمها

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // أو النوع اللي بتستعمله في الـ token
    }
  }
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  profileComplete?: boolean; 
  profileId: string

}