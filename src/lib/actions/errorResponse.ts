'use server';

import { NextResponse } from 'next/server';
import { isString } from 'nhb-toolbox';
import type { ErrorCode } from '@/types';

/**
 * Sends a standardized error JSON response.
 *
 * @param error A short error message to describe the issue or unknown {@link Error error} object.
 * @param code HTTP {@link ErrorCode error status code} to send with the response.
 * @returns A JSON response formatted with error information.
 */
export async function sendErrorResponse(error?: unknown, code: ErrorCode = 500) {
    const errorMsg = isString(error)
        ? error
        : error instanceof Error
          ? error.message
          : 'Something Went Wrong!';

    return NextResponse.json(
        {
            success: false,
            message: errorMsg,
            // errors: [],
            status: code,
        },
        { status: code }
    );
}
