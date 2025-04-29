import type { UserRequest } from '@/app/api/auth/me/route';
import type { TUser } from '@/types/user.types';
import type { NextResponse } from 'next/server';

import { type NextRequest } from 'next/server';

import { sendErrorResponse } from '../actions/errorResponse';
import { decodeJwt } from '../jwt';

import { User } from '@/models/User';

export type Handler = (req: UserRequest) => Promise<NextResponse>;

/**
 * * Extends the original `NextRequest` with custom fields like user info.
 * @param req The original NextRequest
 * @param data Additional data to attach
 * @returns A new request object with additional properties
 */
export function extendRequest<T extends Record<string, unknown>>(
	req: NextRequest,
	data?: T
): NextRequest & T {
	const extended = Object.assign(Object.create(Object.getPrototypeOf(req)), req, data);

	return extended;
}

/**
 * * Middleware to protect API routes by user role.
 * @param roles List of allowed roles.
 * @param handler The next handler to run if authorized.
 */
export function authorizeUser(roles: TUser['role'][], handler: Handler) {
	return async (req: NextRequest) => {
		const token = req.headers.get('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return sendErrorResponse('Unauthorized Access!', 401);
		}

		const { _id } = decodeJwt(token);

		const user = await User.findById(_id);

		if (!user?.role || !roles.includes(user.role)) {
			return sendErrorResponse('Forbidden Access!', 403);
		}

		const { password: _, ...userWithoutPass } = user.toObject();

		const extendedReq = extendRequest(req, { user: userWithoutPass });

		return handler(extendedReq);
	};
}

export function composeMiddlewares(...middlewares: Handler[]): Handler {
	return async (req) => {
		let res: NextResponse | undefined;

		for (const middleware of middlewares) {
			res = await middleware(req);
			// If a middleware returns response early (error), stop chain
			if (res.status !== 200) break;
		}

		return res!;
	};
}
