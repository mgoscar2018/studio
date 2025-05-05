
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add webpack configuration to handle Node.js modules on the client-side
  webpack: (config, { isServer }) => {
    // Exclude 'child_process' from the client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false, // Provide an empty mock for child_process
        fs: false, // Also common to exclude fs if needed by other server-only packages
        net: false, // Exclude net
        tls: false, // Exclude tls
        dns: false, // Exclude dns
      };
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
