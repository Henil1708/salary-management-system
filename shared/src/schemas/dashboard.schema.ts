import { z } from 'zod';

// Machine params (not user-typed form fields) — Zod default messages are
// fine; the server's validate middleware maps them to the generic key.
export const DASHBOARD_DIMENSIONS = ['department', 'country', 'jobLevel'] as const;

// The point-in-time the dashboard is computed at: metrics reflect the state
// "as of" this date (default = now). Salary aggregates use the salary in
// effect at asOf; headcount counts employees hired on/before it.
export const dashboardAsOfQuerySchema = z.object({
  asOf: z.coerce.date().optional(),
});

export const dashboardDimensionQuerySchema = z.object({
  dimension: z.enum(DASHBOARD_DIMENSIONS).default('department'),
  asOf: z.coerce.date().optional(),
});

// Recent salary changes within a [start, end] window (both optional; end
// defaults to now, start unbounded).
export const recentChangesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

export type DashboardDimension = (typeof DASHBOARD_DIMENSIONS)[number];
export type DashboardAsOfQuery = z.infer<typeof dashboardAsOfQuerySchema>;
export type DashboardDimensionQuery = z.infer<typeof dashboardDimensionQuerySchema>;
export type RecentChangesQuery = z.infer<typeof recentChangesQuerySchema>;
