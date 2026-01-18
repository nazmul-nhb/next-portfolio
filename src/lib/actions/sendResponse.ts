'use server';

import { NextResponse } from 'next/server';
import { pluralizer } from 'nhb-toolbox';
import { HTTP_CODES } from 'nhb-toolbox/constants';
import type { SuccessCode, TCollection, TMethod, TResponseDetails } from '@/types';

/**
 * * Sends a formatted JSON response.
 *
 * @param collection The name of the collection (e.g., 'Student').
 * @param method The method type (e.g., 'POST', 'GET', 'PUT', 'PATCH', 'DELETE' etc.).
 * @param data Optional data to include in the response.
 * @param customMessage Optional custom message if needed.
 */
export async function sendResponse<T>(
    collection: TCollection,
    method: TMethod,
    data?: T,
    customMessage?: string
) {
    const { message, statusCode } = buildResponseMeta(collection, method, data);

    const response = {
        success: true,
        message: customMessage ? customMessage : message,
        status: statusCode,
        ...(data && { data }),
    };

    return NextResponse.json(response, { status: statusCode });
}

/**
 * * Generates message and status code based on the collection and method type.
 *
 * @param collection The name of the collection (e.g., 'Student').
 * @param method The method type (e.g., 'POST', 'GET', 'PUT', 'PATCH', 'DELETE' etc.).
 * @param data The data being operated upon.
 * @returns An object containing the formatted message and HTTP status code.
 */
const buildResponseMeta = <T>(
    collection: TCollection,
    method: TMethod,
    data?: T
): TResponseDetails => {
    const isArray = Array.isArray(data);

    let message = 'Operation Successful!',
        statusCode: SuccessCode = HTTP_CODES.OK;

    switch (method) {
        case 'OK':
            statusCode = HTTP_CODES.OK;
            break;
        case 'POST':
            statusCode = HTTP_CODES.CREATED;
            message = `${collection} created successfully!`;
            break;
        case 'GET':
            message = isArray
                ? `${pluralizer.toPlural(collection)} fetched successfully!`
                : `${collection} fetched successfully!`;
            break;
        case 'PUT':
        case 'PATCH':
            message = `${collection} updated successfully!`;
            break;
        case 'DELETE':
            message = `${collection} deleted successfully!`;
            break;
        default:
            statusCode = HTTP_CODES.OK;
            break;
    }

    return { message, statusCode };
};
