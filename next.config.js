/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.yanitzaproducciones.online',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '9mtfxauv5xssy4w3.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig