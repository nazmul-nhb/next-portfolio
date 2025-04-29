import type { DecodedUser } from '@/types/user.types';

import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '@/constants';

/**
 * * Utility function to generate `jsonwebtoken`.
 * @param payload Payload to be encoded in token.
 * @returns Generated Token.
 */
export function signJwt(payload: Record<string, unknown>): string {
	try {
		return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
	} catch (error) {
		throw error;
	}
}

/**
 * * Utility function to decode `jsonwebtoken`.
 * @param token Token from client.
 * @returns Decoded token payload.
 */
export function decodeJwt(token: string): DecodedUser {
	try {
		return jwt.verify(token, JWT_SECRET) as DecodedUser;
	} catch (error) {
		throw error;
	}
}
