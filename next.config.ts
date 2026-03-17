import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
    remotePatterns: [
      { hostname: "picsum.photos", pathname: "/**", protocol: "https" },
      { hostname: "images.unsplash.com", pathname: "/**", protocol: "https" },
      { hostname: "qwvwbwflxukekbalgjdt.supabase.co", pathname: "/**", protocol: "https" },
    ],
  },
  // Allow dev access from network IP (e.g. http://192.168.254.100:3000)
  allowedDevOrigins: ["http://192.168.254.100:3000", "http://localhost:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
