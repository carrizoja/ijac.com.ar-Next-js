# 🚀 iJac IT Solutions - Next.js Website

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-FF69B4?style=for-the-badge&logo=framer)

A modern, high-performance website for iJac IT Solutions built with Next.js 16, featuring comprehensive SEO optimization, responsive design, and cutting-edge animations.

## 🌟 Live Demo

- **Development**: [http://localhost:3000](http://localhost:3000)
- **Production**: [https://ijac.com.ar](https://ijac.com.ar)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [SEO Optimization](#-seo-optimization)
- [Components](#-components)
- [Responsive Design](#-responsive-design)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🎨 **Modern Design**
- ✅ Professional IT services layout
- ✅ Dark/Light theme support
- ✅ Modern typography with Inter + Space Grotesk fonts
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design for all devices

### 🔍 **SEO Optimized**
- ✅ Complete structured data (JSON-LD)
- ✅ Open Graph and Twitter Cards
- ✅ Dynamic sitemap generation
- ✅ Robots.txt configuration
- ✅ Google Analytics integration
- ✅ Core Web Vitals monitoring
- ✅ Local business SEO for Buenos Aires

### 🚀 **Performance**
- ✅ Next.js 16 with App Router
- ✅ Image optimization with Cloudinary
- ✅ Font optimization with next/font
- ✅ Performance monitoring
- ✅ Build-time optimizations

### 📱 **User Experience**
- ✅ Responsive navigation with hamburger menu
- ✅ Smooth scrolling between sections
- ✅ TypeWriter effects for hero sections
- ✅ Interactive testimonials
- ✅ FAQ section with structured data
- ✅ WhatsApp integration
- ✅ Breadcrumb navigation

## 🛠 Tech Stack

### **Core Framework**
- **Next.js 16.2.4** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 19** - Latest React with concurrent features

### **Styling & UI**
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Custom Components** - Reusable UI components
- **Google Fonts** - Inter & Space Grotesk typography

### **SEO & Analytics**
- **Structured Data** - JSON-LD schema implementation
- **Google Analytics 4** - Advanced analytics tracking
- **Next.js Metadata API** - Built-in SEO optimization

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Installation

### Prerequisites
- Node.js 20.9 or later
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/carrizoja/ijac.com.ar-Next-js.git
cd ijac-next-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure environment variables**
```bash
# Create .env.local file
cp .env.local.example .env.local
```

The only frontend variables are the ones that connect the chat widget to an API:
```env
NEXT_PUBLIC_CHAT_AI_ENABLED=true
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the result.

## 📖 Usage

### Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build the static export into out/
npm run build

# Run the test suite
npm run test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Deploy to Hostinger (dry run; add -- --live to upload)
npm run deploy
```

### Environment Configuration

Copy `.env.local.example` to `.env.local` in the root directory:

```env
# Chat widget (optional in local development)
NEXT_PUBLIC_CHAT_AI_ENABLED=true
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001
```

`localhost:3001` is the local chat API started with `npm run dev:chat`; the website itself runs
on `localhost:3000`. When these variables are unset, the chat widget answers deterministically and
never calls an API.

Analytics are wired directly in `src/app/components/SiteDocument.tsx` (GA4 measurement ID), not
through environment variables.

## 📁 Project Structure

```
ijac-next-app/
├── src/
│   ├── app/
│   │   ├── (es)/                # Spanish routes (default locale)
│   │   │   ├── layout.tsx       # Spanish root layout
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── contact/page.tsx
│   │   │   ├── services/
│   │   │   │   ├── page.tsx     # Services listing
│   │   │   │   └── [slug]/page.tsx # Service detail pages
│   │   │   ├── politica-de-privacidad/page.tsx
│   │   │   └── terminos-y-condiciones/page.tsx
│   │   ├── en/                  # English routes
│   │   │   ├── layout.tsx       # English root layout
│   │   │   ├── page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── services/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/page.tsx
│   │   ├── components/          # Shared components
│   │   │   ├── chat/            # Chat engine and API client
│   │   │   └── ui/              # UI primitives
│   │   ├── lib/                 # Theme and shared helpers
│   │   ├── globals.css          # Global styles
│   │   ├── global-not-found.tsx # Shared 404 document
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots configuration
│   ├── data/                    # Business, services, staff, testimonials
│   ├── i18n/                    # Locale routing and copy
│   └── lib/                     # Utility functions
├── packages/
│   ├── contracts/               # Shared chat API contracts
│   └── knowledge/               # Approved knowledge base and retriever
├── chat-api/                    # Groq + Upstash chat API (Vercel)
├── scripts/                     # Deploy and local dev helpers
├── public/                      # Static assets
├── out/                         # Static export output (generated)
├── next.config.ts               # Next.js configuration (static export)
├── components.json              # UI components config
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 🔍 SEO Optimization

### **Comprehensive SEO Implementation**

#### **1. Structured Data (JSON-LD)**
```typescript
// Organization Schema
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "iJac IT Solutions",
  "url": "https://ijac.com.ar",
  "logo": "https://ijac.com.ar/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+54-11-1234-5678",
    "contactType": "customer service"
  }
}
```

#### **2. Local Business SEO**
- 📍 Buenos Aires, Argentina location optimization
- 🏢 Local business schema markup
- 📞 Contact information structured data
- ⏰ Business hours optimization

#### **3. Technical SEO**
- ✅ Dynamic XML sitemap generation
- ✅ SEO-optimized robots.txt
- ✅ Canonical URLs
- ✅ Open Graph meta tags
- ✅ Twitter Card optimization
- ✅ Structured breadcrumbs

#### **4. Performance SEO**
- ⚡ Core Web Vitals monitoring
- 🖼️ Image optimization
- 📱 Mobile-first responsive design
- 🚀 Fast loading times

### **SEO Features by Component**

| Component | SEO Features |
|-----------|-------------|
| `layout.tsx` | Complete metadata, Open Graph, Twitter Cards |
| `StructuredData.tsx` | Organization & Local Business schema |
| `FAQ.tsx` | FAQ structured data for rich snippets |
| `Breadcrumbs.tsx` | SEO breadcrumb navigation |
| `sitemap.ts` | Dynamic sitemap generation |
| `robots.ts` | Search engine directives |

## 🧩 Components

### **Core Components**

#### **Navigation**
- `Navbarijac.tsx` - Desktop navigation with smooth scrolling
- `HamburgerMenu.tsx` - Mobile responsive navigation
- `Breadcrumbs.tsx` - SEO-friendly breadcrumb navigation

#### **Content Sections**
- `Hero.tsx` - Hero section with TypeWriter effects
- `Services.tsx` - IT services showcase
- `About.tsx` - Company information with animations
- `Testimonials.tsx` - Customer testimonials
- `FAQ.tsx` - Frequently asked questions with schema
- `Contact.tsx` - Contact information and forms

#### **SEO & Analytics**
- `StructuredData.tsx` - JSON-LD structured data
- `GoogleAnalytics.tsx` - GA4 integration
- `PerformanceMonitor.tsx` - Core Web Vitals tracking

#### **UI Components** (`src/app/components/ui/`)
- `TypewriterEffect.tsx` - Animated text effects
- `hero-highlight.tsx` - Interactive hero highlights
- `navbar-menu.tsx` - Navigation menu components
- `PrimaryButton.tsx` - Styled button components

### **Component Usage Examples**

```tsx
// Hero with TypeWriter effect
<Hero />

// FAQ with structured data
<FAQ />

// SEO breadcrumbs
<Breadcrumbs items={[
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact' }
]} />

// Analytics integration
<GoogleAnalytics ga_id="GA_MEASUREMENT_ID" />
```

## 📱 Responsive Design

### **Breakpoint Strategy**
- **Mobile First**: Base styles for mobile devices
- **Tablet**: `md:` (768px+) - Tablet optimization
- **Desktop**: `lg:` (1024px+) - Desktop layouts
- **Large Desktop**: `xl:` (1280px+) - Large screens

### **Navigation Responsive Behavior**
```tsx
// Desktop navigation (700px+)
<div className="hidden min-[700px]:block">
  <NavbarIjac />
</div>

// Mobile navigation (<700px)
<div className="block min-[700px]:hidden">
  <HamburgerMenu />
</div>
```

### **Typography Scaling**
- **Mobile**: `text-lg` (18px)
- **Tablet**: `text-xl` (20px)
- **Desktop**: `text-2xl` (24px)
- **Large**: `text-4xl` (36px)

## ⚡ Performance

### **Core Web Vitals Monitoring**
- **LCP** (Largest Contentful Paint) tracking
- **FID** (First Input Delay) measurement
- **CLS** (Cumulative Layout Shift) monitoring
- Real-time performance analytics

### **Optimization Features**
- 🖼️ **Image Optimization**: Cloudinary integration
- 🔤 **Font Optimization**: next/font with display swap
- 📦 **Bundle Optimization**: Tree shaking and code splitting
- 🗜️ **Compression**: Gzip and Brotli compression
- 🚀 **Caching**: Static generation and ISR

### **Performance Monitoring**
```typescript
// Automatic Core Web Vitals tracking
<PerformanceMonitor />

// Performance metrics sent to Google Analytics
window.gtag('event', 'LCP', {
  event_category: 'Web Vitals',
  value: Math.round(lcp),
  non_interaction: true,
});
```

## 🌐 Deployment

### **Hostinger** (Production)

The site is a static export (`output: 'export'` in `next.config.ts`) deployed to Hostinger over
SSH with `rsync`:

```bash
npm run deploy            # build + dry run (shows what would change, touches nothing)
npm run deploy -- --live  # build + upload
```

`--delete` removes server files that are no longer in `out/` (old `_next` chunks); `.htaccess` and
`.well-known/` are protected and never deleted.

One-time setup (SSH access, key, host alias) is documented in
[`HOSTINGER-DEPLOYMENT.md`](./HOSTINGER-DEPLOYMENT.md).

### **Static Hosting**

`npm run build` emits the site to `out/`, so any static host works. Because this is a static
export, there are no API routes or server-side rendering.

#### **Netlify**
```bash
# Build command
npm run build

# Publish directory
out
```

#### **Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "out"]
```

### **Chat API**

The chat widget calls a separate serverless API in `chat-api/`, deployed to Vercel at
`https://api.ijac.com.ar`. It is not part of the static export. See
[`chat-api/README.md`](./chat-api/README.md) and
[`docs/chatbot-release-gates.md`](./docs/chatbot-release-gates.md).

## 🔧 Configuration

### **Next.js Configuration**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  // Additional optimizations
}
```

### **Tailwind Configuration**

Tailwind CSS 4 uses CSS-based configuration. There is no `tailwind.config.ts`; the theme lives in
`src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter);
  --font-heading: var(--font-space-grotesk);
}
```

## 📊 Analytics & Monitoring

### **Google Analytics 4**
- Page views tracking
- User engagement metrics
- Conversion tracking
- Performance metrics

### **Core Web Vitals**
- Real-time performance monitoring
- Automatic metric collection
- Integration with Google Analytics

### **Search Console Integration**
- Sitemap submission
- Index status monitoring
- Search performance analysis

## 🤝 Contributing

1. **Fork the repository**
2. **Create your feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**
```bash
git commit -m 'Add some amazing feature'
```

4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

## 📝 License

Private project. No `LICENSE` file is included, so no license is granted by default.

## 🆘 Support

For support, email jose.carrizo@ijac.com.ar or use the contact page at
[https://ijac.com.ar/contact/](https://ijac.com.ar/contact/).

## 🙏 Acknowledgments

- **Next.js Team** - For the incredible framework
- **Hostinger** - For production hosting
- **Vercel** - For hosting the chat API
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **React Community** - For continuous innovation

---

**Built with ❤️ by iJac IT Solutions Team**
