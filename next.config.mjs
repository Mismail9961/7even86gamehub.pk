// next.config.js
// Suppress url.parse() deprecation warnings from dependencies
if (typeof process !== 'undefined' && process.emitWarning) {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function(warning, type, code, ...args) {
    if (code === 'DEP0169' || (typeof warning === 'string' && warning.includes('url.parse()'))) {
      return; // Suppress the warning
    }
    return originalEmitWarning.call(this, warning, type, code, ...args);
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "50mb",
        },
        // Allow larger request bodies (e.g. single image ~7MB) to avoid 413
        middlewareClientMaxBodySize: "50mb",
    },
    images: {
        qualities: [75, 90, 100],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;