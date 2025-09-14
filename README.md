# PulseRank Turborepo

**Advanced SEO Analytics & Competitive Intelligence Platform**

PulseRank is a comprehensive SEO analytics platform built with modern web technologies, providing deep insights into search engine rankings, backlink analysis, competitor research, and keyword tracking. This monorepo contains both the main application and admin dashboard.

![PulseRank](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-purple)

## 🏗️ Architecture

This Turborepo monorepo includes:

### Applications

- **`pulserank-main`** - Main SEO analytics platform (Port 3000)
- **`pulserank-admin`** - Admin dashboard with analytics and management tools (Port 4000)

### Shared Packages

- **`@repo/db`** - Shared database package with Prisma ORM
- **`@repo/ui`** - Shared React component library
- **`@repo/eslint-config`** - Shared ESLint configurations
- **`@repo/typescript-config`** - Shared TypeScript configurations

## ✨ Key Features

### 🎯 SEO Analytics

- **Campaign Management** - Multi-campaign tracking with customizable keywords
- **SERP Analysis** - Historical ranking monitoring and comparison
- **Domain Intelligence** - Comprehensive domain profiling and metrics
- **Backlink Research** - Advanced backlink analysis and timeline tracking
- **Keyword Research** - Niche discovery and competition analysis
- **Competitive Intelligence** - Market share tracking and benchmarking

### 🛠️ Admin Dashboard

- **User Management** - Organization and role-based access control
- **Billing & Subscriptions** - PayPal integration with subscription management
- **Analytics & Reporting** - Advanced charts and data visualization
- **System Monitoring** - API cache management and performance metrics

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations

### Backend & Data

- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication system
- **TanStack Query** - Server state management
- **PayPal API** - Subscription billing

### Development Tools

- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Fast package manager

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- PayPal API credentials (for billing)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd pulserank-turborepo
   pnpm install
   ```

2. **Set up environment variables**

   ```bash
   # Copy example files and configure
   cp apps/pulserank-main/.env.example apps/pulserank-main/.env.local
   cp apps/pulserank-admin/.env.example apps/pulserank-admin/.env.local
   ```

3. **Set up the database**

   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

4. **Start development servers**

   ```bash
   # Start all applications
   pnpm dev

   # Or start specific applications
   pnpm dev --filter=pulserank-main
   pnpm dev --filter=pulserank-admin
   ```

5. **Access applications**
   - Main App: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:4000](http://localhost:4000)

## 📁 Project Structure

```
pulserank-turborepo/
├── apps/
│   ├── pulserank-main/          # Main SEO platform
│   │   ├── src/app/            # Next.js App Router
│   │   ├── src/components/     # React components
│   │   ├── src/hooks/          # Custom hooks
│   │   └── src/lib/            # Utilities
│   └── pulserank-admin/        # Admin dashboard
│       ├── src/app/            # Admin pages
│       ├── src/components/     # Admin components
│       └── src/server/         # Server-side logic
├── packages/
│   ├── database/               # Shared database package
│   │   ├── prisma/            # Database schema
│   │   └── src/               # Database utilities
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/         # Shared ESLint configs
│   └── typescript-config/      # Shared TypeScript configs
└── turbo.json                  # Turborepo configuration
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                    # Start all development servers
pnpm build                  # Build all applications
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Run database migrations
pnpm db:push               # Push schema changes
pnpm db:studio             # Open Prisma Studio
pnpm db:seed               # Seed database with sample data

# Specific applications
pnpm dev --filter=pulserank-main     # Start main app only
pnpm dev --filter=pulserank-admin    # Start admin app only
pnpm build --filter=pulserank-main   # Build main app only
```

## 🌍 Internationalization

Both applications support multiple languages:

- **English** (en)
- **French** (fr)

Language files are located in `src/messages/` and automatically adapt based on user preferences.

## 🔐 Authentication & Authorization

- **NextAuth.js** integration with multiple providers
- **Role-based access control** (Admin, User, Organization roles)
- **Organization management** with team collaboration
- **Secure session management** with JWT tokens

## 💳 Billing & Subscriptions

- **PayPal integration** for subscription management
- **Multiple plan tiers** (Freelance, Studio, Agency)
- **Usage tracking** and billing history
- **Automated subscription management**

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with models for:

- **Users & Organizations** - Multi-tenant architecture
- **Campaigns & Keywords** - SEO tracking data
- **SERP Data** - Search engine results
- **Backlinks** - Link analysis and history
- **Billing** - Subscription and payment tracking
- **Caching** - API response caching system

## 🚀 Deployment

The applications are designed for deployment on:

- **Vercel** (recommended for Next.js)
- **Railway** or **Supabase** (for PostgreSQL)
- **Docker** containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the SEO community**

_PulseRank - Your comprehensive SEO intelligence platform_
