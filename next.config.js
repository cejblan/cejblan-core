/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.yanitzaproducciones.online',
        port: '', // Si necesitas especificar un puerto
        pathname: '/', // Si necesitas especificar una ruta
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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