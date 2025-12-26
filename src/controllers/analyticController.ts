import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytic/analytic.logic";
import { ServiceNotFoundError } from "../errors/services.error";

export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  trackPageView = async (req: Request, res: Response) => {
    const { path, pageTitle, timeOnPage, scrollDepth } = req.body;

    // Get session from cookie
    let sessionId = req.cookies.analytics_session;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      res.cookie("analytics_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers["referer"];

    // Extract UTM params
    const utmSource = req.query.utm_source as string | undefined;
    const utmMedium = req.query.utm_medium as string | undefined;
    const utmCampaign = req.query.utm_campaign as string | undefined;

    const result = await this.service.trackPageView({
      sessionId,
      path,
      pageTitle,
      timeOnPage,
      scrollDepth,
      ipAddress,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    res.status(200).json(result);
  };

  markConverted = async (req: Request, res: Response) => {
    const sessionId = req.cookies.analytics_session;

    if (!sessionId) {
      throw new ServiceNotFoundError("Session not found");
    }

    const result = await this.service.markConverted(sessionId);
    res.status(200).json(result);
  };

  getOverview = async (req: Request, res: Response) => {
    const { days } = req.query;
    const result = await this.service.getOverviewMetrics(Number(days) || 30);
    res.status(200).json({ data: result, success: true });
  };

  getTopPages = async (req: Request, res: Response) => {
    const { days, limit } = req.query;
    const result = await this.service.getTopPages(
      Number(days) || 30,
      Number(limit) || 10
    );
    res.status(200).json(result);
  };

  getTrafficSources = async (req: Request, res: Response) => {
    const { days } = req.query;
    const result = await this.service.getTrafficSources(Number(days) || 30);
    res.status(200).json(result);
  };
}
