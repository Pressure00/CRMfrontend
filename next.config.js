/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-storage-domain.com'], // Добавьте ваш домен для хранения файлов
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, // Прокси для API
      },
    ];
  },
};

module.exports = nextConfig;