/** HTTP Status Codes */
export const STATUS_CODES = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNSUPPORTED_MEDIA_TYPE: 415,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const;

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const cloudinaryConfig = {
	cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME!,
	api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
	api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!,
};

export const cloudinaryUrls = {
	base_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_BASE_URL!,
	upload_url: process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL!,
};
