import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["five-levitate-cupbearer.ngrok-free.dev"],
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
