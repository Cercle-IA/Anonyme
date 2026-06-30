// next.config.ts

import { type NextConfig } from "next";
import { type Configuration } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ... autres configurations

  turbopack: {},

  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    // ---- DÉBUT DE LA CORRECTION ----

    // Récupère les externals existants, en initialisant un tableau vide si non défini.
    const existingExternals = config.externals || [];

    // Remplace la configuration externals par un nouveau tableau.
    // Ce tableau contient :
    // 1. Les externals existants (s'ils étaient déjà un tableau, on les déverse, sinon on les met dans un tableau).
    // 2. Notre nouvel external pour 'fs'.
    config.externals = [
      ...(Array.isArray(existingExternals)
        ? existingExternals
        : [existingExternals]),
      { fs: "fs" }, // On indique de ne pas bundler 'fs'
    ];

    // ---- FIN DE LA CORRECTION ----

    // Côté client (navigateur), on ne veut pas du tout du module 'fs'.
    if (!isServer) {
      if (!config.resolve) {
        config.resolve = {};
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

export default nextConfig;
