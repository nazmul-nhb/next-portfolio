import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '@/constants';

/**
 * Sign JWT Token
 */
export function signJwt(payload: Record<string, unknown>): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT Token
 */
export function verifyJwt(token: string) {
	return jwt.verify(token, JWT_SECRET);
}
