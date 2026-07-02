import { z } from 'zod';

// Machine params (not user-typed form fields) — Zod default messages are
// fine; the server's validate middleware maps them to the generic key.
export const DASHBOARD_DIMENSIONS = ['department', 'country', 'jobLevel'] as const;

export const dashboardDimensionQuerySchema = z.object({
  dimension: z.enum(DASHBOARD_DIMENSIONS).default('department'),
});

export const recentChangesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type DashboardDimension = (typeof DASHBOARD_DIMENSIONS)[number];
export type DashboardDimensionQuery = z.infer<typeof dashboardDimensionQuerySchema>;
export type RecentChangesQuery = z.infer<typeof recentChangesQuerySchema>;
