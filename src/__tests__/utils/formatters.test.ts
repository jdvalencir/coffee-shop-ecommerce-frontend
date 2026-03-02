import { formatCOP, generateId, maskCardNumber } from '@/utils/formatters';

describe('formatters', () => {
  it('formats COP amounts without decimals', () => {
    expect(formatCOP(65000)).toContain('65');
    expect(formatCOP(65000)).toContain('000');
  });

  it('masks a card number leaving only the last 4 digits', () => {
    expect(maskCardNumber('4242 4242 4242 1234')).toBe('•••• •••• •••• 1234');
  });

  it('generates a transaction-like id', () => {
    const id = generateId();
    expect(id.startsWith('txn-')).toBe(true);
    expect(id.split('-').length).toBeGreaterThanOrEqual(3);
  });
});
