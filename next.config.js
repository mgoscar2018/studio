/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Exclude server-only modules from the client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'mongodb-client-encryption': false, // Needed by MongoDB driver >= 4.0.0
        'aws4': false, // Potentially needed by MongoDB driver for AWS integration
        'kerberos': false, // Potentially needed by MongoDB driver for Kerberos auth
        'snappy': false, // Potentially needed by MongoDB driver for compression
        '@mongodb-js/zstd': false, // Potentially needed by MongoDB driver for compression
        '@aws-sdk/credential-providers': false, // Potentially needed by MongoDB driver
        'socks': false, // Potentially needed by MongoDB driver

        // Core Node modules that might be pulled in by dependencies
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
