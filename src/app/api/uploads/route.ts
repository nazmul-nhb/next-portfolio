import { v2 as cloudinary } from 'cloudinary';
import type { NextRequest } from 'next/server';
import { STATUS_CODES } from 'nhb-toolbox/constants';
import { ENV } from '@/configs/env';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';

const configs = ENV.cloudinary.config;

cloudinary.config(configs);

/**
 * * Sign file before uploading to cloudinary.
 * @returns Timestamp and signature string.
 */
export async function POST(req: NextRequest) {
    const { filename } = (await req.json()) as { filename: string };

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            upload_preset: 'portfolio',
            folder: 'portfolio',
            public_id: filename,
        },
        configs.api_secret
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
 * @param req The Next.js request object containing `public_id` in body.
 */
export async function PUT(req: NextRequest) {
    try {
        const { public_id } = (await req.json()) as { public_id: string };

        if (!public_id) {
            return sendErrorResponse('Public ID is required!', 400);
        }

        const res: { result: string } = await cloudinary.uploader.destroy(public_id);

        if (res.result === 'ok') {
            return sendResponse(
                'N/A',
                'DELETE',
                { deleted_id: public_id },
                'File successfully deleted from Cloudinary!'
            );
        }

        return sendErrorResponse(`Cannot delete file with id ${public_id}`);
    } catch (error) {
        return sendErrorResponse(error, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
}
