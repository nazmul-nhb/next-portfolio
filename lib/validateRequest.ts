'use server';

import type { ZodSchema } from 'zod';

import { NextResponse } from 'next/server';

type ZodResponse<T> = Promise<
	{ success: true; data: T } | { success: false; response: NextResponse }
>;

/**
 * * Validate request data using a Zod schema.
 * @param schema - Zod schema to validate against.
 * @param data - Data to validate.
 * @returns Success status with data or error response.
 */
export async function validateRequest<T, D>(schema: ZodSchema<T>, data: D): ZodResponse<T> {
	const parsed = schema.safeParse(data);

	if (!parsed.success) {
		const fieldErrors = parsed.error.flatten().fieldErrors;

		return {
			success: false,
			response: NextResponse.json(
				{
					success: false,
					message: 'Validation Error!',
					errors: fieldErrors,
					status: 400,
				},
				{ status: 400 }
			),
		};
	}

	return { success: true, data: parsed.data };
}
