/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Garante que o Prisma seja tratado como pacote externo no server bundle
  // (evita problemas de empacotamento do engine em ambiente serverless).
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
