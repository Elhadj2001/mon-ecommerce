/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. On force Next.js à ignorer les erreurs TS
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 2. Tes images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;