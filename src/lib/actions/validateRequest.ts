'use server';

import { NextResponse } from 'next/server';
import { isArrayOfType, isObject, isObjectWithKeys, isString } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { type ZodType, z } from 'zod';

type ZodResponse<T> = Promise<
    { success: true; data: T } | { success: false; response: NextResponse }
>;

/**
 * * Validate request data using a Zod schema.
 * @param schema - Zod schema to validate against.
 * @param data - Data to validate.
 * @returns Success status with data or error response.
 */
export async function validateRequest<T, D>(schema: ZodType<T>, data: D): ZodResponse<D> {
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
        const fieldErrors = z.treeifyError(parsed.error);

        const error = isObjectWithKeys(fieldErrors, ['properties'])
            ? fieldErrors.properties
            : parsed.error;

        let errorMsg = 'Validation Error!';

        if (isObject(error)) {
            const paths = Object.keys(error);

            for (const path of paths) {
                const obj = error[path];

                if (isObjectWithKeys(obj, ['errors']) && isArrayOfType(obj.errors, isString)) {
                    errorMsg = obj.errors
                        .map((msg) => `${toTitleCase(path)}: ${msg}`)
                        .join('; ');
                }
            }
        }

        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message: errorMsg,
                    details: error,
                    status: 400,
                },
                { status: 400 }
            ),
        };
    }

    return { success: true, data: parsed.data as T & D };
}
