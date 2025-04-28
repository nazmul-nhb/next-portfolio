import { v2 as cloudinary } from 'cloudinary';
import { type NextRequest, NextResponse } from 'next/server';

import { cloudinaryConfig } from '@/constants';
import sendResponse from '@/lib/actions/sendResponse';

cloudinary.config(cloudinaryConfig);

/**
 * * Sign file before uploading to cloudinary.
 * @returns Timestamp and signature string.
 */
export async function POST(req: NextRequest) {
	const { filename } = (await req.json()) as { filename: string };

	const timestamp = Math.round(Date.now() / 1000);

	const signature = cloudinary.utils.api_sign_request(
		{
			timestamp,
			upload_preset: 'portfolio',
			folder: 'portfolio',
			public_id: filename,
		},
		cloudinaryConfig.api_secret
	);

	return sendResponse(
		'N/A',
		'GET',
		{ signature, timestamp },
		'File successfully signed by Cloudinary!'
	);
}

/**
 * * Deletes an image from Cloudinary.
 * @param req The Next.js request object containing publicId in body.
 */
export async function PUT(req: NextRequest) {
	try {
		const { publicId } = (await req.json()) as { publicId: string };

		if (!publicId) {
			return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
		}

		const res: { result: string } = await cloudinary.uploader.destroy(publicId);

		if (res.result === 'ok') {
			return sendResponse(
				'N/A',
				'DELETE',
				{ deletedId: publicId },
				'File successfully deleted from Cloudinary!'
			);
		}

		return NextResponse.json({ error: 'Internal Server Error!' }, { status: 500 });
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
}
