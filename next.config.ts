import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Habilita a transformação para styled-components
    styledComponents: true,
  },
};

export default nextConfig;
