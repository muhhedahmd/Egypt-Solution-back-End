import { PrismaClient } from "@prisma/client";

export class AnalyticsRepository {
  constructor(private prisma: PrismaClient) {}

  async aggregateAnalyticsForDate(date: Date) {
    // Set time to start/end of day
    // const startOfDay = new Date(date);
    // startOfDay.setHours(0, 0, 0, 0);
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - 30);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();

    const sessions = await this.prisma.sessionAnalytics.findMany({
      where: {
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // console.log(sessions);
    // 2. Get all page views for this day
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // 3. Calculate metrics
    const uniqueVisitors = sessions.length;
    const totalPageViews = pageViews.length;
    const totalBlogViews = pageViews.filter(
      (pv) => pv.pageType === "blog"
    ).length;
    const contacts = sessions.filter((s) => s.converted).length;

    // Bounce rate
    const bounced = sessions.filter((s) => s.isBounce).length;
    const bounceRate =
      uniqueVisitors > 0 ? (bounced / uniqueVisitors) * 100 : 0;

    // Avg session time
    const totalTime = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
    const avgSessionTime =
      uniqueVisitors > 0 ? Math.round(totalTime / uniqueVisitors) : 0;

    // Device breakdown
    const mobileVisitors = sessions.filter((s) => s.device === "mobile").length;
    const desktopVisitors = sessions.filter(
      (s) => s.device === "desktop"
    ).length;
    const tabletVisitors = sessions.filter((s) => s.device === "tablet").length;

    // Traffic sources by medium
    const directVisitors = sessions.filter(
      (s) => !s.utmMedium || s.utmMedium === "none" || s.utmMedium === "direct"
    ).length;
    const searchVisitors = sessions.filter(
      (s) => s.utmMedium === "organic"
    ).length;
    const socialVisitors = sessions.filter(
      (s) => s.utmMedium === "social"
    ).length;
    const referralVisitors = sessions.filter(
      (s) => s.utmMedium === "referral"
    ).length;

    // 4. Create or update Analytics row for this date
const analytics =    await this.prisma.analytics.upsert({
      where: { date: startOfDay },
      create: {
        date: startOfDay,
        uniqueVisitors,
        totalPageViews,
        totalBlogViews,
        avgSessionTime,
        bounceRate,
        contacts,
        formSubmissions: contacts, // Same as contacts for now
        mobileVisitors,
        desktopVisitors,
        tabletVisitors,
        directVisitors,
        searchVisitors,
        socialVisitors,
        referralVisitors,
      },
      update: {
        uniqueVisitors,
        totalPageViews,
        totalBlogViews,
        avgSessionTime,
        bounceRate,
        contacts,
        formSubmissions: contacts,
        mobileVisitors,
        desktopVisitors,
        tabletVisitors,
        directVisitors,
        searchVisitors,
        socialVisitors,
        referralVisitors,
      },
    });

  }

  async createSession(data: {
    sessionId: string;
    firstPagePath: string;
    lastPagePath: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    device?: string;
    browser?: string;
    os?: string;
    ipHash?: string;
    country?: string;
    city?: string;
  }) {
    return this.prisma.sessionAnalytics.create({
      data: {
        ...data,
        isBounce: true,
      },
    });
  }

  async findSessionById(sessionId: string) {
    return this.prisma.sessionAnalytics.findUnique({
      where: { sessionId },
    });
  }

  async updateSession(
    sessionId: string,
    data: {
      lastPagePath: string;
      pageCount: number;
      totalDuration: number;
      isBounce: boolean;
    }
  ) {
    return this.prisma.sessionAnalytics.update({
      where: { sessionId },
      data: {
        ...data,
        endedAt: new Date(),
      },
    });
  }

  async markSessionConverted(sessionId: string) {
    return this.prisma.sessionAnalytics.updateMany({
      where: { sessionId },
      data: { converted: true },
    });
  }

  async createPageView(data: {
    sessionId: string;
    path: string;
    pageTitle?: string;
    pageType?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    device?: string;
    browser?: string;
    os?: string;
    userAgent?: string;
    ipHash?: string;
    country?: string;
    city?: string;
    timeOnPage?: number;
    scrollDepth?: number;
    isNewSession: boolean;
    isBounce: boolean;
  }) {
    return this.prisma.pageView.create({ data });
  }

  async getAnalyticsByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.sessionAnalytics.findMany({
      where: {
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getPageViewsByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getTopPages(startDate: Date, limit: number) {
    return this.prisma.pageView.groupBy({
      by: ["path", "pageTitle"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { _all: true },
      _avg: {
        timeOnPage: true,
        scrollDepth: true,
      },
      orderBy: {
        _count: { path: "desc" },
      },
      take: limit,
    });
  }

  async getUniqueViewsForPage(path: string, startDate: Date) {
    return this.prisma.pageView.findMany({
      where: {
        path,
        createdAt: { gte: startDate },
      },
      distinct: ["sessionId"],
    });
  }
}
