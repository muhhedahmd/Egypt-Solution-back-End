

import { z } from 'zod';

export const trackPageViewSchema = z.object({
  body: z.object({
    path: z.string().min(1, 'Path is required'),
    pageTitle: z.string().optional(),
    timeOnPage: z.number().int().min(0).optional(),
    scrollDepth: z.number().int().min(0).max(100).optional()
  })
});

export const getAnalyticsSchema = z.object({
  query: z.object({
    days: z.string().optional().transform(val => val ? parseInt(val) : 30),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
});

export const getTopPagesSchema = z.object({
  query: z.object({
    days: z.string().optional().transform(val => val ? parseInt(val) : 30),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
  })
});