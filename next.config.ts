import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/starkizard/blackjack",
        destination: "/starkizard/casino/blackjack",
        permanent: true,
      },
      {
        source: "/starkizard/games",
        destination: "/starkizard",
        permanent: true,
      },
      {
        source: "/starkizard/play/tt",
        destination: "/starkizard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
