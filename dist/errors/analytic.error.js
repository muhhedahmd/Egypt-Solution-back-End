"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPagesSchema = exports.getAnalyticsSchema = exports.trackPageViewSchema = void 0;
const zod_1 = require("zod");
exports.trackPageViewSchema = zod_1.z.object({
    body: zod_1.z.object({
        path: zod_1.z.string().min(1, 'Path is required'),
        pageTitle: zod_1.z.string().optional(),
        timeOnPage: zod_1.z.number().int().min(0).optional(),
        scrollDepth: zod_1.z.number().int().min(0).max(100).optional()
    })
});
exports.getAnalyticsSchema = zod_1.z.object({
    query: zod_1.z.object({
        days: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 30),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional()
    })
});
exports.getTopPagesSchema = zod_1.z.object({
    query: zod_1.z.object({
        days: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 30),
        limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10)
    })
});
