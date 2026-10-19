import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursor / some browsers hit 127.0.0.1 while `next dev` serves localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
