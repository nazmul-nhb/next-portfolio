export const ENV = {
    nodeEnv: (process.env.NODE_ENV ?? 'development') as string,
    dbUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    authSecret: process.env.AUTH_SECRET as string,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    email: {
        address: process.env.EMAIL_ADDRESS as string,
        password: process.env.EMAIL_PASSWORD as string,
    },
    adminEmail: process.env.ADMIN_EMAIL as string,
    cloudinary: {
        config: {
            cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME as string,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
            api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string,
        },
        folder: 'portfolio',
        preset: 'portfolio',
        urls: {
            base_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_BASE_URL as string,
            upload_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL as string,
        },
    },
};
