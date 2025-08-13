# 🚀 iJac IT Solutions - Next.js Website

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-FF69B4?style=for-the-badge&logo=framer)

A modern, high-performance website for iJac IT Solutions built with Next.js 15, featuring comprehensive SEO optimization, responsive design, and cutting-edge animations.

## 🌟 Live Demo

- **Development**: [http://localhost:3001](http://localhost:3001)
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
- ✅ Next.js 15 with App Router
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
- **Next.js 15.4.6** - React framework with App Router
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
- **Google Tag Manager** - Tag management system
- **Next.js Metadata API** - Built-in SEO optimization

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Installation

### Prerequisites
- Node.js 18.17 or later
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
cp .env.example .env.local
```

Add your analytics IDs:
```env
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_GTM_ID=your-google-tag-manager-id
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
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_GTM_ID=GTM_CONTAINER_ID

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=info@ijac.com.ar
NEXT_PUBLIC_CONTACT_PHONE=+54-11-1234-5678

# Business Information
NEXT_PUBLIC_BUSINESS_NAME=iJac IT Solutions
NEXT_PUBLIC_BUSINESS_URL=https://ijac.com.ar
```

## 📁 Project Structure

```
ijac-next-app/
├── src/
│   ├── app/
│   │   ├── components/           # Reusable components
│   │   │   ├── ui/              # UI components
│   │   │   ├── About.tsx        # About section
│   │   │   ├── Contact.tsx      # Contact section
│   │   │   ├── FAQ.tsx          # FAQ with structured data
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   ├── Hero.tsx         # Hero section
│   │   │   ├── HamburgerMenu.tsx # Mobile navigation
│   │   │   ├── Navbarijac.tsx   # Desktop navigation
│   │   │   ├── Services.tsx     # Services section
│   │   │   ├── Testimonials.tsx # Customer testimonials
│   │   │   ├── StructuredData.tsx # SEO structured data
│   │   │   ├── GoogleAnalytics.tsx # Analytics integration
│   │   │   ├── PerformanceMonitor.tsx # Performance tracking
│   │   │   ├── Breadcrumbs.tsx  # SEO breadcrumbs
│   │   │   └── WhatsApp.tsx     # WhatsApp integration
│   │   ├── contact/
│   │   │   └── page.tsx         # Contact page
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout with SEO
│   │   ├── page.tsx             # Homepage
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots configuration
│   └── lib/
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── components.json              # UI components config
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
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
- `GoogleAnalytics.tsx` - GA4 and GTM integration
- `PerformanceMonitor.tsx` - Core Web Vitals tracking

#### **UI Components**
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

### **Vercel Deployment** (Recommended)

1. **Connect to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

2. **Environment Variables**
Set up your environment variables in Vercel dashboard:
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GTM_ID`

3. **Custom Domain**
Configure your custom domain in Vercel settings.

### **Alternative Deployment Options**

#### **Netlify**
```bash
# Build command
npm run build

# Publish directory
out
```

#### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

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
```typescript
// tailwind.config.ts
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-space-grotesk)'],
      }
    }
  }
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email info@ijac.com.ar or join our Slack channel.

## 🙏 Acknowledgments

- **Next.js Team** - For the incredible framework
- **Vercel** - For hosting and deployment
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **React Community** - For continuous innovation

---

**Built with ❤️ by iJac IT Solutions Team**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcarrizoja%2Fijac.com.ar-Next-js)
