/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'apiverse-lpx4.onrender.com',
        process.env.NEXTAUTH_URL?.replace('https://', '').replace('http://', '') ?? '',
      ].filter(Boolean),
    },
  },
}

module.exports = nextConfig
