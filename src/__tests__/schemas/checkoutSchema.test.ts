import { checkoutSchema, creditCardSchema, deliverySchema } from '@/schemas/checkoutSchema';

describe('checkoutSchema', () => {
  const validDelivery = {
    fullName: 'Julian Valencia',
    email: 'julian@example.com',
    phone: '+57 300 123 4567',
    address: 'Calle 123 # 45-67',
    city: 'Medellin',
    department: 'Antioquia',
  };

  const validPayment = {
    cardNumber: '4242 4242 4242 4242',
    holderName: 'Julian Valencia',
    expiry: '12/32',
    cvv: '123',
  };

  it('accepts valid delivery data', () => {
    expect(() => deliverySchema.parse(validDelivery)).not.toThrow();
  });

  it('rejects invalid delivery data', () => {
    expect(() =>
      deliverySchema.parse({
        ...validDelivery,
        email: 'invalid-email',
        phone: '12',
      }),
    ).toThrow();
  });

  it('accepts valid credit card data', () => {
    expect(() => creditCardSchema.parse(validPayment)).not.toThrow();
  });

  it('rejects invalid credit card data', () => {
    expect(() =>
      creditCardSchema.parse({
        ...validPayment,
        cardNumber: '4242 4242 4242 4241',
        expiry: '01/20',
        cvv: '12',
      }),
    ).toThrow();
  });

  it('accepts a complete checkout payload', () => {
    expect(() =>
      checkoutSchema.parse({
        delivery: validDelivery,
        payment: validPayment,
      }),
    ).not.toThrow();
  });

  it('accepts a card expiring in the current month and year', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-03-15T12:00:00Z'));

      expect(() =>
        creditCardSchema.parse({
          ...validPayment,
          expiry: '03/26',
        }),
      ).not.toThrow();
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects a card expiring earlier this year', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-03-15T12:00:00Z'));

      expect(() =>
        creditCardSchema.parse({
          ...validPayment,
          expiry: '02/26',
        }),
      ).toThrow();
    } finally {
      jest.useRealTimers();
    }
  });
});
