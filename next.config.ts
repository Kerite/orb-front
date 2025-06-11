import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.externals.push({
      'pino-pretty': 'pino-pretty',
    });
    return config;
  },
};

export default nextConfig;
