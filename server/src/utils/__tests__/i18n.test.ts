import { translate } from '@utils/i18n';

describe('translate', () => {
  it('resolves a locale key to its English text', () => {
    expect(translate('errors.validation.common.invalidSalary', 'en')).toBe(
      'Invalid or missing salary'
    );
  });

  it('interpolates {{placeholders}} from VALIDATION_LIMITS', () => {
    expect(translate('errors.validation.auth.passwordTooShort', 'en')).toBe(
      'Password must be at least 8 characters'
    );
  });

  it('falls back to the key itself for unknown keys', () => {
    expect(translate('errors.validation.not.a.real.key', 'en')).toBe(
      'errors.validation.not.a.real.key'
    );
  });
});
