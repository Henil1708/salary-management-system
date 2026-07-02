import test from 'node:test';
import assert from 'node:assert/strict';
import { ZodTypeAny } from 'zod';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createEmployeeSchema,
  createSalaryRecordSchema,
  csvRowSchema,
} from '../index';
import enLocale from '../locales/en.json';

// Flatten en.json to a set of dot-notation keys
const flattenKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as Record<string, unknown>, path)
      : [path];
  });

const localeKeys = new Set(flattenKeys(enLocale as unknown as Record<string, unknown>));

// Batteries of invalid payloads chosen to trigger every custom message path
// in each schema (missing fields, too-long values, bad formats, unknown enums,
// each password regex individually).
const invalidPayloads: Array<[string, ZodTypeAny, unknown]> = [
  ['login: empty object', loginSchema, {}],
  ['login: blank values', loginSchema, { identifier: ' ', password: '' }],
  ['forgotPassword: empty object', forgotPasswordSchema, {}],
  ['resetPassword: empty object', resetPasswordSchema, {}],
  ['resetPassword: too short', resetPasswordSchema, { token: 't', newPassword: 'Ab1' }],
  [
    'resetPassword: too long',
    resetPasswordSchema,
    { token: 't', newPassword: `Ab1${'x'.repeat(120)}` },
  ],
  ['resetPassword: no uppercase', resetPasswordSchema, { token: 't', newPassword: 'abcdefg1' }],
  ['resetPassword: no lowercase', resetPasswordSchema, { token: 't', newPassword: 'ABCDEFG1' }],
  ['resetPassword: no number', resetPasswordSchema, { token: 't', newPassword: 'Abcdefgh' }],
  ['createEmployee: empty object', createEmployeeSchema, {}],
  [
    'createEmployee: all values invalid',
    createEmployeeSchema,
    {
      employeeCode: 'x'.repeat(30),
      firstName: 'y'.repeat(150),
      lastName: 'z'.repeat(150),
      email: 'not-an-email',
      department: 'Astrology',
      countryCode: 'XX',
      jobLevel: 'Wizard',
      status: 'MAYBE',
      hireDate: 'not-a-date',
    },
  ],
  ['createSalaryRecord: empty object', createSalaryRecordSchema, {}],
  [
    'createSalaryRecord: all values invalid',
    createSalaryRecordSchema,
    { amount: -100, currency: 'ZZZ', effectiveDate: 'nope', reason: 'r'.repeat(300) },
  ],
  [
    'csvRow: all cells empty',
    csvRowSchema,
    Object.fromEntries(
      [
        'employeeCode',
        'firstName',
        'lastName',
        'email',
        'department',
        'countryCode',
        'jobLevel',
        'status',
        'hireDate',
        'salaryAmount',
        'salaryCurrency',
      ].map((h) => [h, ''])
    ),
  ],
  [
    'csvRow: all cells invalid',
    csvRowSchema,
    {
      employeeCode: 'x'.repeat(30),
      firstName: 'y'.repeat(150),
      lastName: 'z'.repeat(150),
      email: 'not-an-email',
      department: 'Astrology',
      countryCode: 'XX',
      jobLevel: 'Wizard',
      status: 'MAYBE',
      hireDate: 'not-a-date',
      salaryAmount: '-5',
      salaryCurrency: 'ZZZ',
    },
  ],
];

test('every schema validation message is a locale key that exists in en.json', () => {
  const seen = new Set<string>();

  for (const [label, schema, payload] of invalidPayloads) {
    const result = schema.safeParse(payload);
    assert.equal(result.success, false, `${label}: expected payload to be invalid`);

    for (const issue of result.error!.issues) {
      seen.add(issue.message);
      assert.match(
        issue.message,
        /^errors\.validation\./,
        `${label}: message "${issue.message}" (at ${issue.path.join('.')}) is not a locale key`
      );
      assert.ok(
        localeKeys.has(issue.message),
        `${label}: key "${issue.message}" is missing from en.json`
      );
    }
  }

  // Sanity: the batteries actually exercised a meaningful number of keys
  assert.ok(seen.size >= 20, `expected >= 20 distinct keys exercised, got ${seen.size}`);
});

test('interpolation placeholders in error texts match VALIDATION_LIMITS keys', async () => {
  const { VALIDATION_LIMITS } = await import('../constants/validation-limits');
  const limitNames = new Set(Object.keys(VALIDATION_LIMITS));
  const errorTexts = flattenKeys(enLocale.errors as unknown as Record<string, unknown>).map(
    (key) => {
      const value = key
        .split('.')
        .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], enLocale.errors);
      return [key, String(value)] as const;
    }
  );

  for (const [key, text] of errorTexts) {
    for (const match of text.matchAll(/\{\{(\w+)\}\}/g)) {
      assert.ok(
        limitNames.has(match[1]),
        `errors.${key}: placeholder {{${match[1]}}} has no matching VALIDATION_LIMITS entry`
      );
    }
  }
});
