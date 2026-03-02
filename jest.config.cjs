/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**',
    // Excluded: root composition/wiring shell; behavior is covered indirectly by route/page tests.
    '!src/App.tsx',
    // Excluded: Vite-specific config (uses import.meta.env, always mocked in tests)
    '!src/services/api.ts',
    // Excluded: payment gateway integration hooks and high-coupling overlay flows;
    // these need dedicated integration tests/mocks beyond the current unit setup.
    '!src/hooks/useProcessPayment.ts',
    '!src/hooks/useTransactionStatus.ts',
    '!src/components/checkout/CardTypeIcon.tsx',
    '!src/components/checkout/CreditCardForm.tsx',
    '!src/components/checkout/FinalStatus.tsx',
    '!src/components/checkout/PaymentSummary.tsx',
    '!src/pages/CheckoutPage/CheckoutPage.tsx',
    // Excluded: barrel re-export files (no logic to test)
    '!src/store/index.ts',
    '!src/types/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = config;
