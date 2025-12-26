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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
class AnalyticsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    aggregateAnalyticsForDate(date) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set time to start/end of day
            // const startOfDay = new Date(date);
            // startOfDay.setHours(0, 0, 0, 0);
            const startOfDay = new Date();
            startOfDay.setDate(startOfDay.getDate() - 30);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            const sessions = yield this.prisma.sessionAnalytics.findMany({
                where: {
                    startedAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            // console.log(sessions);
            // 2. Get all page views for this day
            const pageViews = yield this.prisma.pageView.findMany({
                where: {
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
            });
            // 3. Calculate metrics
            const uniqueVisitors = sessions.length;
            const totalPageViews = pageViews.length;
            const totalBlogViews = pageViews.filter((pv) => pv.pageType === "blog").length;
            const contacts = sessions.filter((s) => s.converted).length;
            // Bounce rate
            const bounced = sessions.filter((s) => s.isBounce).length;
            const bounceRate = uniqueVisitors > 0 ? (bounced / uniqueVisitors) * 100 : 0;
            // Avg session time
            const totalTime = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
            const avgSessionTime = uniqueVisitors > 0 ? Math.round(totalTime / uniqueVisitors) : 0;
            // Device breakdown
            const mobileVisitors = sessions.filter((s) => s.device === "mobile").length;
            const desktopVisitors = sessions.filter((s) => s.device === "desktop").length;
            const tabletVisitors = sessions.filter((s) => s.device === "tablet").length;
            // Traffic sources by medium
            const directVisitors = sessions.filter((s) => !s.utmMedium || s.utmMedium === "none" || s.utmMedium === "direct").length;
            const searchVisitors = sessions.filter((s) => s.utmMedium === "organic").length;
            const socialVisitors = sessions.filter((s) => s.utmMedium === "social").length;
            const referralVisitors = sessions.filter((s) => s.utmMedium === "referral").length;
            // 4. Create or update Analytics row for this date
            const analytics = yield this.prisma.analytics.upsert({
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
            console.log(`✅ Aggregated ${uniqueVisitors} visitors for ${startOfDay.toISOString().split("T")[0]} `, analytics);
        });
    }
    createSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.sessionAnalytics.create({
                data: Object.assign(Object.assign({}, data), { isBounce: true }),
            });
        });
    }
    findSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.sessionAnalytics.findUnique({
                where: { sessionId },
            });
        });
    }
    updateSession(sessionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.sessionAnalytics.update({
                where: { sessionId },
                data: Object.assign(Object.assign({}, data), { endedAt: new Date() }),
            });
        });
    }
    markSessionConverted(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.sessionAnalytics.updateMany({
                where: { sessionId },
                data: { converted: true },
            });
        });
    }
    createPageView(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pageView.create({ data });
        });
    }
    getAnalyticsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.analytics.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            });
        });
    }
    getSessionsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.sessionAnalytics.findMany({
                where: {
                    startedAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
        });
    }
    getPageViewsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pageView.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
        });
    }
    getTopPages(startDate, limit) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    getUniqueViewsForPage(path, startDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pageView.findMany({
                where: {
                    path,
                    createdAt: { gte: startDate },
                },
                distinct: ["sessionId"],
            });
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
