import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Facebook CDN
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      // Discord CDN - this will fix your current error
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname:  '/**',
      },
      // Other common image hosting services
      {
        protocol:  'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname:  '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Google Drive images
      {
        protocol: 'https',
        hostname: 'drive. google.com',
        port: '',
        pathname:  '/**',
      },
      // Instagram CDN
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
