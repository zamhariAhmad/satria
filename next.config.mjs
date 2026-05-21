/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (config, { isServer }) => {
    // MSW v2 ships separate browser/node entrypoints. Tell webpack to ignore
    // the one that doesn't apply to each compilation target so Next.js does
    // not try to resolve "msw/browser" during the server build.
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    if (isServer) {
      config.resolve.alias["msw/browser"] = false;
    } else {
      config.resolve.alias["msw/node"] = false;
    }
    return config;
  },
};

export default nextConfig;
