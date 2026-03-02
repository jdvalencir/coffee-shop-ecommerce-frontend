import {
  detectCardType,
  formatCardNumber,
  formatExpiry,
  luhnCheck,
} from '@/utils/cardValidation';

describe('cardValidation', () => {
  describe('luhnCheck', () => {
    it('returns true for a valid card number', () => {
      expect(luhnCheck('4242424242424242')).toBe(true);
    });

    it('returns true for a valid card number with spaces', () => {
      expect(luhnCheck('4242 4242 4242 4242')).toBe(true);
    });

    it('returns false for invalid card numbers', () => {
      expect(luhnCheck('4242424242424241')).toBe(false);
      expect(luhnCheck('abcd')).toBe(false);
      expect(luhnCheck('')).toBe(false);
    });
  });

  describe('detectCardType', () => {
    it('detects Visa cards', () => {
      expect(detectCardType('4242 4242 4242 4242')).toBe('visa');
    });

    it('detects MasterCard classic range', () => {
      expect(detectCardType('5555555555554444')).toBe('mastercard');
    });

    it('detects MasterCard 2-series ranges', () => {
      expect(detectCardType('2221000000000009')).toBe('mastercard');
      expect(detectCardType('2720999999999992')).toBe('mastercard');
      expect(detectCardType('222')).toBe('mastercard');
      expect(detectCardType('272')).toBe('mastercard');
    });

    it('returns null for unsupported or empty values', () => {
      expect(detectCardType('6011000000000004')).toBeNull();
      expect(detectCardType('100')).toBeNull();
      expect(detectCardType('2721999999999999')).toBeNull();
      expect(detectCardType('')).toBeNull();
    });
  });

  describe('formatCardNumber', () => {
    it('groups digits in blocks of four', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    });

    it('strips non-digits and caps at 16 digits', () => {
      expect(formatCardNumber('4242-4242-4242-4242-9999')).toBe('4242 4242 4242 4242');
    });
  });

  describe('formatExpiry', () => {
    it('formats raw digits as MM/YY', () => {
      expect(formatExpiry('1234')).toBe('12/34');
    });

    it('returns partial input while less than 3 digits', () => {
      expect(formatExpiry('1')).toBe('1');
      expect(formatExpiry('12')).toBe('12');
    });

    it('strips non-digits and caps at 4 digits', () => {
      expect(formatExpiry('12/3456')).toBe('12/34');
    });
  });
});
