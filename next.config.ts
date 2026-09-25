import type { NextConfig } from "next";

function supabaseHost(): string | undefined {
  try {
    return process.env.PROJECT_URL ? new URL(process.env.PROJECT_URL).hostname : undefined;
  } catch {
    return undefined;
  }
}

const host = supabaseHost();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_PROJECT_URL: process.env.PROJECT_URL ?? "",
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.PUBLISHABLE_KEY ?? "",
  },
  images: {
    remotePatterns: host
      ? [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
