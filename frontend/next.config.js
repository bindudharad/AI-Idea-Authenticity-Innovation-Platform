/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  devIndicators: false,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

module.exports = nextConfig;
