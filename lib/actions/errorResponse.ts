'use server';

import type { TStatusCode } from '@/types';
import type { GenericObject } from 'nhb-toolbox/object/types';

import { NextResponse } from 'next/server';

/**
 * Sends a standardized error JSON response.
 *
 * @param errorMessage A short error message to describe the issue.
 * @param statusCode HTTP status code to send with the response.
 * @param errors A list of error details or validation issues.
 * @returns A JSON response formatted with error information.
 */
export async function sendErrorResponse<T extends GenericObject>(
	errorMessage?: string,
	statusCode?: TStatusCode,
	errors?: T
) {
	return NextResponse.json(
		{
			success: false,
			message: errorMessage || 'Something Went Wrong!',
			...(errors && { errors: errors }),
			status: statusCode || 500,
		},
		{ status: statusCode }
	);
}
