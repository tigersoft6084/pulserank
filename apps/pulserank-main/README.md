# 🔍 SEObserver

**Advanced SEO Analytics & Competitive Intelligence Platform**

SEObserver is a comprehensive SEO analytics platform that provides deep insights into search engine rankings, backlink analysis, competitor research, and keyword tracking. Built with modern web technologies, it offers enterprise-grade SEO tools in an intuitive, user-friendly interface.

![SEObserver Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.3.1-purple)

## ✨ Features

### 🎯 **Campaign Management**

- **Multi-campaign tracking** with customizable keywords and domains
- **Real-time ranking monitoring** with historical data visualization
- **Alert system** for ranking changes and performance drops
- **Competitive analysis** within campaign context

### 🔍 **SERP Analysis**

- **SERP Machine**: Compare search results across different time periods
- **Historical SERP tracking** with detailed position changes
- **Keyword volatility analysis** and trend identification
- **Multi-search engine support** (Google US, UK, France)

### 🌐 **Domain Intelligence**

- **Comprehensive domain profiling** with on-site and off-site metrics
- **Backlink analysis** with detailed anchor text distribution
- **Traffic estimation** and historical performance tracking
- **Competitor identification** and comparison tools
- **Domain authority metrics** (Trust Flow, Citation Flow)

### 🔗 **Backlink Research**

- **Backlink timeline** with historical data
- **Common backlinks discovery** between domains
- **Top backlinks identification** with quality metrics
- **Lost backlinks tracking** and recovery opportunities
- **Referring domains analysis**

### 📊 **Keyword Research**

- **Niche finder** for discovering profitable keywords
- **Keyword metrics** with search volume and difficulty
- **Organic visibility tracking** with historical trends
- **Competition analysis** with detailed metrics
- **Google Trends integration**

### 🎯 **Competitive Intelligence**

- **Competitor identification** and analysis
- **Market share tracking** and comparison
- **Common backlinks discovery** between competitors
- **Performance benchmarking** across multiple metrics

### 📈 **Advanced Tools**

- **Domain extractor** for finding domains ranking for specific keywords
- **Website interlink analysis** for internal linking opportunities
- **Same IP checker** for identifying related domains
- **URL analysis** with detailed metrics and insights

### 👀 **Watchlist & Monitoring**

- **Custom watchlist** for tracking important domains
- **Email alerts** for significant changes
- **Bulk operations** for efficient management
- **Real-time monitoring** with instant notifications

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions

### Backend & Data

- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication system
- **TanStack Query** - Server state management
- **Axios** - HTTP client for API calls

### External APIs

- **DataForSEO** - SERP and keyword data
- **Majestic** - Backlink analysis
- **SEMrush** - Competitive intelligence

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Storybook** - Component development
- **Vitest** - Unit testing

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for external services (DataForSEO, Majestic, SEMrush)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/seobserver.git
   cd seobserver
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/seobserver"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # External APIs
   DATAFORSEO_LOGIN="your-dataseo-login"
   DATAFORSEO_PASSWORD="your-dataseo-password"
   MAJESTIC_API_KEY="your-majestic-api-key"
   SEMRUSH_API_KEY="your-semrush-api-key"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
seobserver/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Internationalization
│   │   │   ├── (private-layout)/  # Protected routes
│   │   │   │   ├── campaigns/     # Campaign management
│   │   │   │   ├── sites/         # Domain analysis
│   │   │   │   ├── serpmachine/   # SERP comparison
│   │   │   │   ├── positions/     # Ranking analysis
│   │   │   │   ├── backlinks/     # Backlink research
│   │   │   │   ├── organic_keywords/ # Keyword tracking
│   │   │   │   ├── watchlist/     # Domain monitoring
│   │   │   │   ├── domainextractor/ # Domain discovery
│   │   │   │   └── nichefinder/   # Keyword research
│   │   │   └── (public-layout)/   # Public routes
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── features/         # Feature-specific components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript type definitions
│   └── messages/             # Internationalization files
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── stories/                  # Storybook stories
```

## 🌍 Internationalization

SEObserver supports multiple languages:

- **English** (en)
- **French** (fr)

Language files are located in `src/messages/` and the interface automatically adapts based on the user's locale preference.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run format       # Check code formatting
npm run format:fix   # Fix code formatting

# Testing & Documentation
npm run storybook    # Start Storybook
npm run build-storybook # Build Storybook
```

## 📊 Key Features in Detail

### Campaign Management

Track multiple SEO campaigns with custom keywords and domains. Monitor rankings, set alerts, and analyze performance trends over time.

### SERP Machine

Compare search engine results across different time periods to identify ranking changes, new competitors, and market shifts.

### Domain Profiler

Comprehensive analysis of any domain including:

- **On-site metrics**: Page speed, mobile-friendliness, technical SEO
- **Off-site metrics**: Backlink profile, domain authority, traffic estimates
- **Historical data**: Performance trends and ranking history
- **Competitive analysis**: Comparison with industry benchmarks

### Backlink Research

Advanced backlink analysis tools:

- **Timeline view**: Historical backlink acquisition patterns
- **Quality assessment**: Trust Flow, Citation Flow, and spam scores
- **Competitor overlap**: Find common backlinks between domains
- **Recovery opportunities**: Identify and track lost backlinks

### Keyword Intelligence

Comprehensive keyword research and tracking:

- **Niche discovery**: Find profitable keyword opportunities
- **Competition analysis**: Assess keyword difficulty and competition
- **Trend tracking**: Monitor keyword performance over time
- **Volume estimation**: Search volume and traffic potential

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.seobserver.com](https://docs.seobserver.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/seobserver/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/seobserver/discussions)

## 🙏 Acknowledgments

- **DataForSEO** for SERP and keyword data
- **Majestic** for backlink analysis
- **SEMrush** for competitive intelligence
- **Next.js** team for the amazing framework
- **Vercel** for hosting and deployment

---

**Built with ❤️ for the SEO community**

_SEObserver - Your comprehensive SEO intelligence platform_
