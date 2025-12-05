export const ENV = {
    dbUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    cloudinary: {
        config: {
            cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME as string,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
            api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET as string,
        },
        urls: {
            base_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_BASE_URL as string,
            upload_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL as string,
        }
    },
};
