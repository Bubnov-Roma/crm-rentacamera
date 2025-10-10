/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rentacamera/ui', '@rentacamera/database', '@rentacamera/core'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
