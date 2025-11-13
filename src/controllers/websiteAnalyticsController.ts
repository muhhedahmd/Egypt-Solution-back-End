import { NextFunction, Request, Response } from "express";
import { websiteAnalyticsLogic } from "../services/websiteAnalytics/websiteAnalytics.logic";

export class WebsiteAnalyticsController {
  constructor(private logic: websiteAnalyticsLogic) {}

  async collect(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId =
        (req.cookies?.pv_sid as string | undefined) || crypto.randomUUID();

      if (!req.cookies["pv_sid"])
      {

        res
        .cookie("pv_sid", sessionId, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({ message: "ok" });
      }
      const payload = {...req.body , sessionId , userAgent: req.headers["user-agent"] || ""};
      await req.app.get("pageviewQueue").add('pv'  ,  {
        payload ,
        ip : req.ip || req.socket.remoteAddress || ""
      })
      return res.status(204).send()
    } catch (error) {
      next(error);
    }
  }
}
