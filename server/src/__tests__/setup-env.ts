// Test environment — config/env.ts validates at import time, so every
// required variable must exist before any module under test loads.
// No real network/DB values: unit tests never touch live services
// (docs/TRADEOFFS.md §8).
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
process.env['DIRECT_URL'] = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-0123456789abcdef0123456789abcdef';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-0123456789abcdef0123456789abcdef';
process.env['LOG_LEVEL'] = 'error';
