/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "divulgacandcontas.tse.jus.br",
      },
    ],
  },
};

export default nextConfig;
