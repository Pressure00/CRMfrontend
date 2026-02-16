/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [process.env.NEXT_PUBLIC_STORAGE_DOMAIN || 'localhost'],
  },
  async rewrites() {
    // Проверяем, что API_URL определен
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`, // Исправлено: добавлен /api/
      },
    ];
  },
};

module.exports = nextConfig;