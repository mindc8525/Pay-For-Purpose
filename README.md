# Digital Heroes

A subscription-driven web application combining golf performance tracking, monthly prize draws, and charitable giving.

## Features

- **Golf Score Tracking**: Track up to 5 Stableford scores with automatic rolling retention
- **Monthly Prize Draws**: Participate in monthly draws based on your scores
- **Charity Support**: Choose a charity and contribute a percentage of your subscription
- **Admin Dashboard**: Complete management interface for users, draws, charities, and winners

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Payments**: Stripe
- **Authentication**: Supabase Auth with RBAC

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-heroes
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

APP_URL=http://localhost:3000
```

5. Set up the database:
   - Run the SQL schema in `src/db/schema/001_initial_schema.sql` in your Supabase SQL Editor
   - Run the seed data in `src/db/seeds/001_initial_data.sql` (optional)

6. Create Stripe products and prices:
   - Create a monthly subscription product in Stripe
   - Create a yearly subscription product in Stripe
   - Update `SUBSCRIPTION_MONTHLY_PRICE_ID` and `SUBSCRIPTION_YEARLY_PRICE_ID` with your Stripe price IDs

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:

- `users` - User profiles extending Supabase auth
- `plans` - Subscription plans (monthly/yearly)
- `subscriptions` - User subscriptions
- `scores` - Golf scores (max 5 per user)
- `charities` - Partner charities
- `draws` - Monthly draw configurations
- `winners` - Winner records with verification status

## API Endpoints

### Public
- `GET /api/charities` - List active charities
- `GET /api/subscription/plans` - List available plans

### User (Authenticated)
- `POST /api/scores` - Create a score
- `GET /api/scores` - List user's scores
- `PATCH /api/me/charity` - Set charity preference
- `GET /api/winnings` - List user's winnings

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/draws` - Create a draw
- `POST /api/admin/draws/:id/simulate` - Simulate a draw
- `POST /api/admin/draws/:id/publish` - Publish a draw
- `POST /api/admin/winners/:id/verify` - Verify a winner
- `POST /api/admin/winners/:id/payout` - Mark payout complete

## Key Business Rules

### Scores
- Maximum 5 scores per user (rolling retention)
- Score range: 1-45 (Stableford)
- One score per date per user

### Charity Contributions
- Minimum contribution: 10%
- Configurable up to 100%

### Prize Pools
- 5-number match: 40% (jackpot, rolls over if unclaimed)
- 4-number match: 35%
- 3-number match: 25%

## Testing

Run tests:
```bash
npm test
```

Run type checking:
```bash
npm run typecheck
```

Run linting:
```bash
npm run lint
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API routes
│   ├── admin/           # Admin pages
│   └── dashboard/       # User dashboard
├── components/          # Reusable UI components
├── features/            # Feature-specific components
├── lib/                 # Utilities and clients
├── server/              # Server-side services
│   └── services/        # Business logic services
├── types/               # TypeScript types
└── db/                  # Database schema and seeds
```

## Configuration & PRD Defaults

Key configurable values and operational defaults (as required by Specification Section 21):

- `PRIZE_POOL_FUNDING_PERCENTAGE`: Percentage of active subscription revenue dedicated to funding the monthly prize pool (default: `20`).
- `MAX_CHARITY_CONTRIBUTION_PERCENTAGE`: Maximum voluntary charity contribution percentage allowed (default: `100`; minimum is enforced at `10%`).
- `Draw Strategies`: Pluggable strategy interface with `RandomDrawStrategy` and `AlgorithmicDrawStrategy` (weighted by score frequency).
- `Score Mapping`: `scoresToDrawNumbers` clamps each Stableford score between 1 and 45 to form the draw numbers.
- `Subscription Plans`: Stored in `plans` database table with configurable billing intervals and pricing (defaults: Monthly $9.99, Yearly $99.99).

## Deployment

The application is ready for deployment to Vercel or similar platforms:

1. Set environment variables in your deployment platform
2. Deploy the Next.js application
3. Configure Stripe webhooks to point to `/api/webhooks/stripe`

## Security

- Server-side validation on all mutations
- Row-level security (RLS) policies in Supabase
- RBAC with USER and ADMIN roles
- Protected file access for winner proofs
- Webhook signature verification for Stripe

## License

Private - All rights reserved
