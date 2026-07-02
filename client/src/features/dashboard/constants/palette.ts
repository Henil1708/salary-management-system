// Chart colors per the dataviz method:
//  - CATEGORICAL: the validated reference palette in its FIXED slot order
//    (ordering is the CVD-safety mechanism — worst adjacent ΔE 24.2, never
//    cycle or re-sort). Identity job only (department donut); the legend
//    table beside the donut satisfies the relief rule for sub-3:1 slots.
//  - Magnitude jobs (bar chart, country bars) use ONE sequential hue — the
//    brand indigo — never the categorical set.
export const CATEGORICAL = [
  '#2a78d6',
  '#1baf7a',
  '#eda100',
  '#008300',
  '#4a3aa7',
  '#e34948',
  '#e87ba4',
  '#eb6834',
] as const;

export const SEQUENTIAL_PRIMARY = '#4f46e5'; // brand indigo-600
export const SEQUENTIAL_SOFT = '#c7d2fe'; // indigo-200 — track/background bars

export const CHART_INK = {
  muted: '#898781',
  grid: '#e1e0d9',
} as const;
