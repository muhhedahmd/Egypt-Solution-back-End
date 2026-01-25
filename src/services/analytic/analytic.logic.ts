
import crypto from 'crypto';
import { AnalyticsRepository } from './analytic.reposetory';

export class AnalyticsService {
  constructor(private repository: AnalyticsRepository) {}

  // Hash IP for privacy
  hashIP(ip: string): string {
    if (!ip) return 'unknown';
    return crypto
      .createHash('sha256')
      .update(ip + (process.env.IP_SALT || 'salt'))
      .digest('hex')
      .substring(0, 16);
  }

  // Parse user agent
  parseUserAgent(ua: string): { device: string; browser: string; os: string } {
    const userAgent = ua.toLowerCase();
    
    let device = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      device = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(ua)) {
      device = 'mobile';
    }
    
    let browser = 'unknown';
    if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('edge')) browser = 'edge';
    else if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('safari')) browser = 'safari';
    
    let os = 'unknown';
    if (userAgent.includes('windows')) os = 'windows';
    else if (userAgent.includes('mac')) os = 'macos';
    else if (userAgent.includes('linux')) os = 'linux';
    else if (userAgent.includes('android')) os = 'android';
    else if (userAgent.includes('ios') || userAgent.includes('iphone')) os = 'ios';
    
    return { device, browser, os };
  }

  // Parse referrer
  parseReferrer(referrer: string | null): { source: string; medium: string } {
    if (!referrer) return { source: 'direct', medium: 'none' };
    
    const url = referrer.toLowerCase();
    
    if (url.includes('google')) return { source: 'google', medium: 'organic' };
    if (url.includes('bing')) return { source: 'bing', medium: 'organic' };
    if (url.includes('yahoo')) return { source: 'yahoo', medium: 'organic' };
    
    if (url.includes('facebook') || url.includes('fb.com')) 
      return { source: 'facebook', medium: 'social' };
    if (url.includes('twitter') || url.includes('t.co')) 
      return { source: 'twitter', medium: 'social' };
    if (url.includes('linkedin')) 
      return { source: 'linkedin', medium: 'social' };
    if (url.includes('instagram')) 
      return { source: 'instagram', medium: 'social' };
    
    try {
      return { source: new URL(referrer).hostname, medium: 'referral' };
    } catch {
      return { source: 'direct', medium: 'none' };
    }
  }

  // Get page type
  getPageType(path: string): string {
    if (path === '/') return 'home';
    if (path.startsWith('/blog/')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/about')) return 'about';
    return 'other';
  }

  // Track page view
  async trackPageView(data: {


    sessionId: string;
    path: string;
    pageTitle?: string;
    timeOnPage?: number;
    scrollDepth?: number;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }) {
    const ipHash = this.hashIP(data.ipAddress);
    const { device, browser, os } = this.parseUserAgent(data.userAgent);
    const { source, medium } = this.parseReferrer(data.referrer || null);
    const pageType = this.getPageType(data.path);

    // Check if session exists
    let session = await this.repository.findSessionById(data.sessionId);
    const isNewSession = !session;

    if (!session) {
      // Create new session
      session = await this.repository.createSession({
        sessionId: data.sessionId,
        firstPagePath: data.path,
        lastPagePath: data.path,
        referrer: data.referrer,
        utmSource: data.utmSource || source,
        utmMedium: data.utmMedium || medium,
        utmCampaign: data.utmCampaign,
        device,
        browser,
        os,
        ipHash
      });
    } else {
      // Update existing session
      await this.repository.updateSession(data.sessionId, {
        lastPagePath: data.path,
        pageCount: session.pageCount + 1,
        totalDuration: session.totalDuration + (data.timeOnPage || 0),
        isBounce: false
      });
    }
    // Create page view
    await this.repository.createPageView({
      sessionId: data.sessionId,
      path: data.path,
      pageTitle: data.pageTitle,
      pageType,
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      device,
      browser,
      os,
      userAgent: data.userAgent,
      ipHash,
      timeOnPage: data.timeOnPage,
      scrollDepth: data.scrollDepth,
      isNewSession,
      isBounce: isNewSession
    });

    return { success: true, sessionId: data.sessionId, isNewSession };
  }

  // Mark session as converted
  async markConverted(sessionId: string) {
    await this.repository.markSessionConverted(sessionId);
    return { success: true };

  }

  // Get overview metrics
  async getOverviewMetrics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    await this.repository.aggregateAnalyticsForDate(startDate
      
    );

    const analytics = await this.repository.getAnalyticsByDateRange(
      startDate,
      new Date()
    );

    const totals = analytics.reduce(
      (acc, day) => ({
        totalVisitors: acc.totalVisitors + day.uniqueVisitors,
        totalPageViews: acc.totalPageViews + day.totalPageViews,
        totalBlogViews: acc.totalBlogViews + day.totalBlogViews,
        totalContacts: acc.totalContacts + day.contacts
      }),
      { totalVisitors: 0, totalPageViews: 0, totalBlogViews: 0, totalContacts: 0 }
    );

    const avgBounceRate =
      analytics.length > 0
        ? analytics.reduce((sum, day) => sum + (day.bounceRate || 0), 0) /
          analytics.length
        : 0;

    const avgSessionTime =
      analytics.length > 0
        ? Math.round(
            analytics.reduce((sum, day) => sum + (day.avgSessionTime || 0), 0) /
              analytics.length
          )
        : 0;

    return {
      ...totals,
      avgBounceRate: Math.round(avgBounceRate * 10) / 10,
      avgSessionTime,
      chartData: analytics.map((day) => ({
        date: day.date.toISOString().split('T')[0],
        visitors: day.uniqueVisitors,
        pageViews: day.totalPageViews,
        blogViews: day.totalBlogViews
      }))
    };
  }

  // Get top pages
  async getTopPages(days: number = 30, limit: number = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pages = await this.repository.getTopPages(startDate, limit);

    const pagesWithUniqueViews = await Promise.all(
      pages.map(async (page) => {
        const uniqueViews = await this.repository.getUniqueViewsForPage(
          page.path,
          startDate
        );

        return {
          path: page.path,
          title: page.pageTitle || page.path,
          views: page._count._all,
          uniqueViews: uniqueViews.length,
          avgTimeOnPage: page._avg.timeOnPage
            ? Math.round(page._avg.timeOnPage)
            : null,
          avgScrollDepth: page._avg.scrollDepth
            ? Math.round(page._avg.scrollDepth)
            : null
        };
      })
    );

    return pagesWithUniqueViews;
  }

  // Get traffic sources
  async getTrafficSources(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.repository.getSessionsByDateRange(
      startDate,
      new Date()
    );

    const sourceMap = new Map<string, number>();

    sessions.forEach((session) => {
      const source =
        session.utmSource ||
        (session.referrer ? new URL(session.referrer).hostname : 'direct');
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const sources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, visitors: count }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);

    const analytics = await this.repository.getAnalyticsByDateRange(
      startDate,
      new Date()
    );

    const mediumTotals = analytics.reduce(
      (acc, day) => ({
        direct: acc.direct + day.directVisitors,
        search: acc.search + day.searchVisitors,
        social: acc.social + day.socialVisitors,
        referral: acc.referral + day.referralVisitors
      }),
      { direct: 0, search: 0, social: 0, referral: 0 }
    );

    const mediums = [
      { medium: 'direct', visitors: mediumTotals.direct },
      { medium: 'search', visitors: mediumTotals.search },
      { medium: 'social', visitors: mediumTotals.social },
      { medium: 'referral', visitors: mediumTotals.referral }
    ].sort((a, b) => b.visitors - a.visitors);

    return { sources, mediums };
  }
}

