# @opennotify/landing Changelog

All notable changes to this package will be documented in this file.

---

## [Unreleased]

---

## [0.2.0] - 2025-12-21

### Added
- **Marketing Pages**
  - Pricing page with full feature comparison table
  - Annual/Monthly billing toggle with 17% discount display
  - Enterprise tier with "Contact Sales" CTA
  - Features page with detailed feature descriptions and visuals
  - Channels page with per-channel details (SMS, Telegram, Email, Push, WhatsApp)
  - Use Cases page with 6 industry-specific use cases
  - About page with company info, mission, values, and timeline

- **Blog System**
  - MDX-based blog with frontmatter support
  - Blog listing page with featured post
  - Individual blog post pages with reading time
  - Category and tag support
  - Sample blog posts included

- **Navigation Updates**
  - Updated header navigation to new pages
  - Updated footer links

- **New Data Structures**
  - `PRICING_TIERS_FULL` with monthly/annual pricing
  - `PRICING_FEATURES_MATRIX` for comparison table
  - `PRICING_FAQ` for pricing-specific questions
  - `FEATURES_DETAILED` with comprehensive feature info
  - `CHANNELS_DETAILED` with provider information
  - `USE_CASES` with industry examples and stats

---

## [0.1.1] - 2025-12-21

### Changed
- Default dev server port changed from 3001 to 4403

---

## [0.1.0] - 2025-12-21

### Added
- **Project Setup**
  - Next.js 15 with App Router
  - TypeScript configuration
  - Tailwind CSS 4.0 with custom design system
  - next-themes for dark mode (dark mode first)
  - Framer Motion for animations
  - Inter + JetBrains Mono fonts

- **Layout Components**
  - `Header` - Sticky navigation with mobile menu, theme toggle
  - `Footer` - 4-column footer with links and social icons
  - `ThemeToggle` - Dark/light mode switcher
  - `Container` - Max-width wrapper component
  - `SectionHeading` - Reusable section titles

- **Landing Page Sections**
  - `Hero` - Badge, headline, CTAs, code snippet preview
  - `SocialProof` - Client logos marquee animation
  - `ProblemSolution` - Two-column before/after comparison
  - `Channels` - 5 channel cards (SMS, Telegram, Email, Push, WhatsApp)
  - `Features` - 3 key features (Smart Routing, Multi-Channel, Cost Savings)
  - `CodeExamples` - Tabbed code examples (Node.js, Python, PHP, Go, cURL)
  - `SavingsCalculator` - Interactive cost savings calculator
  - `Testimonials` - 3 customer testimonial cards
  - `Pricing` - 4 pricing tiers (FREE, STARTER, GROWTH, BUSINESS)
  - `FAQ` - 7 accordion items with common questions
  - `FinalCTA` - Bottom call-to-action section

- **UI Components** (shadcn/ui style)
  - Button, Badge, Card, Tabs, Accordion, Slider

- **Design System**
  - Primary: #2563EB (blue)
  - Accent: #7C3AED (violet)
  - Success: #10B981 (green)
  - Dark mode first with slate background

- **SEO**
  - Meta tags for title, description, keywords
  - Open Graph and Twitter Card meta
  - Russian language as default

---

*Last updated: December 2025*
