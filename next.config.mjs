import "./instrumentation";
import * as Sentry from "@sentry/nextjs";

Sentry.init({ dsn: process.env.SENTRY_DSN });

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
