/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Izinkan domain eksternal untuk gambar
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
            // Tambahkan domain production server Anda
            {
                protocol: 'https',
                hostname: 'api.edu-sipikat.com', // Ganti dengan domain backend Anda
                pathname: '/uploads/**',
            },
        ],
        
        // Format gambar yang didukung
        formats: ['image/webp', 'image/avif'],
        
        // Ukuran gambar yang akan di-generate
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        
        // Quality default untuk optimasi gambar
        minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 hari
        
        // Disable static image import optimization jika perlu
        disableStaticImages: false,
        
        // Dangerously allow SVG (hati-hati dengan security)
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    
    // Experimental features untuk performa
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react'],
    },
    
    // Compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
};

export default nextConfig;