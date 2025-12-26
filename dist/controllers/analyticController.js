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
exports.AnalyticsController = void 0;
const services_error_1 = require("../errors/services.error");
class AnalyticsController {
    constructor(service) {
        this.service = service;
        this.trackPageView = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
            const ipAddress = ((_b = (_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) === null || _b === void 0 ? void 0 : _b.trim()) ||
                req.ip ||
                "unknown";
            const userAgent = req.headers["user-agent"] || "";
            const referrer = req.headers["referer"];
            // Extract UTM params
            const utmSource = req.query.utm_source;
            const utmMedium = req.query.utm_medium;
            const utmCampaign = req.query.utm_campaign;
            const result = yield this.service.trackPageView({
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
        });
        this.markConverted = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.cookies.analytics_session;
            if (!sessionId) {
                throw new services_error_1.ServiceNotFoundError("Session not found");
            }
            const result = yield this.service.markConverted(sessionId);
            res.status(200).json(result);
        });
        this.getOverview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { days } = req.query;
            const result = yield this.service.getOverviewMetrics(Number(days) || 30);
            res.status(200).json({ data: result, success: true });
        });
        this.getTopPages = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { days, limit } = req.query;
            const result = yield this.service.getTopPages(Number(days) || 30, Number(limit) || 10);
            res.status(200).json(result);
        });
        this.getTrafficSources = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { days } = req.query;
            const result = yield this.service.getTrafficSources(Number(days) || 30);
            res.status(200).json(result);
        });
    }
}
exports.AnalyticsController = AnalyticsController;
