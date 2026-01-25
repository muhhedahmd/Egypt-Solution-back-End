import { User } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      lang?: string;
      isRTL?: boolean;
      user?: UserPayload;
    }
  }
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  profileComplete?: boolean;
  profileId: string;
}
