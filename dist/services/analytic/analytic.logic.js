"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class AnalyticsService {
    constructor(repository) {
        this.repository = repository;
    }
    // Hash IP for privacy
    hashIP(ip) {
        if (!ip)
            return 'unknown';
        return crypto_1.default
            .createHash('sha256')
            .update(ip + (process.env.IP_SALT || 'salt'))
            .digest('hex')
            .substring(0, 16);
    }
    // Parse user agent
    parseUserAgent(ua) {
        const userAgent = ua.toLowerCase();
        let device = 'desktop';
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            device = 'tablet';
        }
        else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(ua)) {
            device = 'mobile';
        }
        let browser = 'unknown';
        if (userAgent.includes('firefox'))
            browser = 'firefox';
        else if (userAgent.includes('edge'))
            browser = 'edge';
        else if (userAgent.includes('chrome'))
            browser = 'chrome';
        else if (userAgent.includes('safari'))
            browser = 'safari';
        let os = 'unknown';
        if (userAgent.includes('windows'))
            os = 'windows';
        else if (userAgent.includes('mac'))
            os = 'macos';
        else if (userAgent.includes('linux'))
            os = 'linux';
        else if (userAgent.includes('android'))
            os = 'android';
        else if (userAgent.includes('ios') || userAgent.includes('iphone'))
            os = 'ios';
        return { device, browser, os };
    }
    // Parse referrer
    parseReferrer(referrer) {
        if (!referrer)
            return { source: 'direct', medium: 'none' };
        const url = referrer.toLowerCase();
        if (url.includes('google'))
            return { source: 'google', medium: 'organic' };
        if (url.includes('bing'))
            return { source: 'bing', medium: 'organic' };
        if (url.includes('yahoo'))
            return { source: 'yahoo', medium: 'organic' };
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
        }
        catch (_a) {
            return { source: 'direct', medium: 'none' };
        }
    }
    // Get page type
    getPageType(path) {
        if (path === '/')
            return 'home';
        if (path.startsWith('/blog/'))
            return 'blog';
        if (path.startsWith('/contact'))
            return 'contact';
        if (path.startsWith('/about'))
            return 'about';
        return 'other';
    }
    // Track page view
    trackPageView(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipHash = this.hashIP(data.ipAddress);
            const { device, browser, os } = this.parseUserAgent(data.userAgent);
            const { source, medium } = this.parseReferrer(data.referrer || null);
            const pageType = this.getPageType(data.path);
            // Check if session exists
            let session = yield this.repository.findSessionById(data.sessionId);
            const isNewSession = !session;
            if (!session) {
                // Create new session
                session = yield this.repository.createSession({
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
            }
            else {
                // Update existing session
                yield this.repository.updateSession(data.sessionId, {
                    lastPagePath: data.path,
                    pageCount: session.pageCount + 1,
                    totalDuration: session.totalDuration + (data.timeOnPage || 0),
                    isBounce: false
                });
            }
            // Create page view
            yield this.repository.createPageView({
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
        });
    }
    // Mark session as converted
    markConverted(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.markSessionConverted(sessionId);
            return { success: true };
        });
    }
    // Get overview metrics
    getOverviewMetrics() {
        return __awaiter(this, arguments, void 0, function* (days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            yield this.repository.aggregateAnalyticsForDate(startDate);
            const analytics = yield this.repository.getAnalyticsByDateRange(startDate, new Date());
            const totals = analytics.reduce((acc, day) => ({
                totalVisitors: acc.totalVisitors + day.uniqueVisitors,
                totalPageViews: acc.totalPageViews + day.totalPageViews,
                totalBlogViews: acc.totalBlogViews + day.totalBlogViews,
                totalContacts: acc.totalContacts + day.contacts
            }), { totalVisitors: 0, totalPageViews: 0, totalBlogViews: 0, totalContacts: 0 });
            const avgBounceRate = analytics.length > 0
                ? analytics.reduce((sum, day) => sum + (day.bounceRate || 0), 0) /
                    analytics.length
                : 0;
            const avgSessionTime = analytics.length > 0
                ? Math.round(analytics.reduce((sum, day) => sum + (day.avgSessionTime || 0), 0) /
                    analytics.length)
                : 0;
            return Object.assign(Object.assign({}, totals), { avgBounceRate: Math.round(avgBounceRate * 10) / 10, avgSessionTime, chartData: analytics.map((day) => ({
                    date: day.date.toISOString().split('T')[0],
                    visitors: day.uniqueVisitors,
                    pageViews: day.totalPageViews,
                    blogViews: day.totalBlogViews
                })) });
        });
    }
    // Get top pages
    getTopPages() {
        return __awaiter(this, arguments, void 0, function* (days = 30, limit = 10) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const pages = yield this.repository.getTopPages(startDate, limit);
            const pagesWithUniqueViews = yield Promise.all(pages.map((page) => __awaiter(this, void 0, void 0, function* () {
                const uniqueViews = yield this.repository.getUniqueViewsForPage(page.path, startDate);
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
            })));
            return pagesWithUniqueViews;
        });
    }
    // Get traffic sources
    getTrafficSources() {
        return __awaiter(this, arguments, void 0, function* (days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const sessions = yield this.repository.getSessionsByDateRange(startDate, new Date());
            const sourceMap = new Map();
            sessions.forEach((session) => {
                const source = session.utmSource ||
                    (session.referrer ? new URL(session.referrer).hostname : 'direct');
                sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
            });
            const sources = Array.from(sourceMap.entries())
                .map(([source, count]) => ({ source, visitors: count }))
                .sort((a, b) => b.visitors - a.visitors)
                .slice(0, 10);
            const analytics = yield this.repository.getAnalyticsByDateRange(startDate, new Date());
            const mediumTotals = analytics.reduce((acc, day) => ({
                direct: acc.direct + day.directVisitors,
                search: acc.search + day.searchVisitors,
                social: acc.social + day.socialVisitors,
                referral: acc.referral + day.referralVisitors
            }), { direct: 0, search: 0, social: 0, referral: 0 });
            const mediums = [
                { medium: 'direct', visitors: mediumTotals.direct },
                { medium: 'search', visitors: mediumTotals.search },
                { medium: 'social', visitors: mediumTotals.social },
                { medium: 'referral', visitors: mediumTotals.referral }
            ].sort((a, b) => b.visitors - a.visitors);
            return { sources, mediums };
        });
    }
}
exports.AnalyticsService = AnalyticsService;
