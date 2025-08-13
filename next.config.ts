import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: ['res.cloudinary.com', 'cloudinary.com', 'assets.aceternity.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Base configuration for static hosting
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
  
  // Note: Security headers will need to be configured at the web server level (Hostinger)
  // since they don't work with static export
};

export default nextConfig;
