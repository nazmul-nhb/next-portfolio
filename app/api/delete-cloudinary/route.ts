import { v2 as cloudinary } from 'cloudinary';
import { type NextRequest, NextResponse } from 'next/server';

import { cloudinaryConfig } from '@/constants';
import sendResponse from '@/lib/actions/sendResponse';

cloudinary.config(cloudinaryConfig);

/**
 * Deletes an image from Cloudinary.
 * @param req The Next.js request object containing publicId in body.
 */
export async function POST(req: NextRequest) {
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
