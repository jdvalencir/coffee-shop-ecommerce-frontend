# Hispania Coffee — Coffee Shop E-commerce Frontend

A single-page application built for the Wompi FullStack test. Users can browse specialty coffee products and complete a purchase via Wompi's payment gateway (sandbox).

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript + Vite 7 |
| State | Redux Toolkit v2 + react-redux v9 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 (configured in `src/index.css`) |
| Components | shadcn/ui pattern (CVA + Radix UI primitives) |
| HTTP | Axios |
| Testing | **Jest 30** + Babel-jest + Testing Library |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL. When absent the app runs with **mock data**. |

```env
# .env
VITE_API_BASE_URL=http://localhost:3001
```

## GitHub Actions Deployment

The repository now includes a GitHub Actions workflow at `.github/workflows/deploy-s3.yml` that:

- runs on every push to `main`
- installs dependencies with `pnpm`
- runs the test suite
- builds the Vite app
- syncs `dist/` to an AWS S3 bucket
- optionally invalidates CloudFront

Configure these repository values before using it:

| Type | Name | Description |
|---|---|---|
| Secret | `AWS_ROLE_TO_ASSUME` | IAM Role ARN to assume from GitHub via OIDC (`sts:AssumeRoleWithWebIdentity`) |
| Variable | `AWS_REGION` | AWS region where the bucket lives (example: `us-east-1`) |
| Variable | `S3_BUCKET` | Target S3 bucket name only (without `s3://`) |
| Variable | `VITE_API_BASE_URL` | Production API base URL injected during the build |
| Variable (optional) | `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution to invalidate after deploy |

Recommended AWS setup:

- enable GitHub OIDC in AWS IAM
- create a role trusted by `token.actions.githubusercontent.com`
- grant that role permissions for `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject`, and, if used, `cloudfront:CreateInvalidation`
- configure your S3 bucket for static website hosting or behind CloudFront

## Application Flow

| Step | Route | Description |
|---|---|---|
| 1 | `/` | Product catalog — browse and select a coffee |
| 2 | `/checkout` | Credit card + delivery form (Dialog over catalog) |
| 3 | `/summary` | Order summary before final confirmation |
| 4 | `/status` | Transaction result (approved / declined / error) |
| → | `/` | Return to catalog with updated stock |

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage report
pnpm test:coverage
```

## Test Coverage Results

> Tool: Jest 30 + `@testing-library/react`

```
------------------------|---------|----------|---------|---------|
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   91.03 |    84.11 |   91.13 |   92.89 |
 src/App.tsx            |   57.89 |    25.00 |   75.00 |   61.53 |
 components/product     |         |          |         |         |
  ProductCard.tsx       |  100.00 |  100.00  |  100.00 |  100.00 |
 components/ui          |         |          |         |         |
  badge.tsx             |  100.00 |  100.00  |  100.00 |  100.00 |
  button.tsx            |  100.00 |   66.66  |  100.00 |  100.00 |
  card.tsx              |  100.00 |  100.00  |  100.00 |  100.00 |
 contexts               |         |          |         |         |
  ThemeContext.tsx       |  100.00 |   91.66  |  100.00 |  100.00 |
 lib/utils.ts           |  100.00 |  100.00  |  100.00 |  100.00 |
 mock/products.ts       |  100.00 |  100.00  |  100.00 |  100.00 |
 pages/ProductPage      |         |          |         |         |
  ProductPage.tsx       |   87.23 |   80.55  |   79.16 |   86.04 |
 services               |         |          |         |         |
  productService.ts     |  100.00 |  100.00  |  100.00 |  100.00 |
 store/hooks.ts         |  100.00 |  100.00  |  100.00 |  100.00 |
 store/store.ts         |  100.00 |  100.00  |  100.00 |  100.00 |
 store/slices           |         |          |         |         |
  checkoutSlice.ts      |   90.47 |   50.00  |  100.00 |   94.73 |
  productsSlice.ts      |  100.00 |  100.00  |  100.00 |  100.00 |
 utils/persistence.ts   |   88.88 |  100.00  |  100.00 |   94.73 |
------------------------|---------|----------|---------|---------|

Test Suites : 11 passed, 11 total
Tests       : 140 passed, 140 total
Statements  : 91.03%  ✅  (threshold: 80%)
Branches    : 84.11%  ✅  (threshold: 80%)
Functions   : 91.13%  ✅  (threshold: 80%)
Lines       : 92.89%  ✅  (threshold: 80%)
```

### Test Suite Breakdown

| Test file | Tests | What is covered |
|---|---|---|
| `lib/utils.test.ts` | 10 | `cn()` — all branches including Tailwind conflict resolution |
| `utils/persistence.test.ts` | 18 | All localStorage helpers, overwrite & error paths |
| `store/slices/productsSlice.test.ts` | 11 | Reducer initial state, `decrementStock`, async thunk pending/fulfilled/rejected |
| `store/slices/checkoutSlice.test.ts` | 14 | All 6 actions: selectProduct, setStep, setCreditCard, setDelivery, resetCheckout |
| `store/store.test.ts` | 5 | Persistence subscriber — step/product/delivery written to localStorage on dispatch |
| `services/productService.test.ts` | 11 | Mock mode (no API call), real API mode (axios mocked), error propagation |
| `components/ProductCard.test.tsx` | 19 | Rendering, all 4 roast levels, 3 stock states (normal/low/out), CTA |
| `components/UIComponents.test.tsx` | 14 | Badge (4 variants), all Card sub-components, composition |
| `contexts/ThemeContext.test.tsx` | 12 | Provider, toggle, localStorage persistence, `<html>` class mutation, error boundary |
| `pages/ProductPage.test.tsx` | 23 | Header, loading/error/success states, 4 roast filters, search by name/origin/note, navigation |
| `App.test.tsx` | 3 | Render without crash, root route renders ProductPage, theme toggle present |

## Project Structure

```
src/
├── types/index.ts              — Domain types + fee constants (BASE_FEE_COP, DELIVERY_FEE_COP)
├── mock/products.ts            — 6 specialty coffee products (mock data)
├── lib/utils.ts                — cn() helper (clsx + tailwind-merge)
├── contexts/ThemeContext.tsx   — Dark/light mode provider with localStorage persistence
├── utils/persistence.ts        — localStorage save/load/clear helpers
├── store/
│   ├── hooks.ts                — Typed useAppDispatch / useAppSelector
│   ├── store.ts                — Redux store + persistence subscriber
│   └── slices/
│       ├── productsSlice.ts    — fetchProducts thunk, decrementStock
│       └── checkoutSlice.ts    — step, selectedProduct, creditCard, delivery
├── services/
│   ├── api.ts                  — Axios instance (USE_MOCK flag driven by VITE_API_BASE_URL)
│   └── productService.ts       — getProducts, getProductById
├── components/
│   ├── ui/                     — button, card, badge
│   └── product/ProductCard.tsx
└── pages/
    └── ProductPage/ProductPage.tsx — Catalog with hero, filters, search, trust badges
```

## Fee Constants (COP)

| Fee | Amount |
|---|---|
| Base processing fee | $3,000 |
| Delivery fee | $8,000 |
