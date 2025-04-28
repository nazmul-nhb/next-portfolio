import type { TUser } from '@/types/user.types';
import type { UserRequest } from '@/app/api/auth/me/route';

import { type NextRequest, NextResponse } from 'next/server';

import { verifyJwt } from '../jwt';

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
	data: T
): NextRequest & T {
	const extended = Object.assign(Object.create(Object.getPrototypeOf(req)), req, data);

	return extended;
}

/**
 * * Middleware to protect API routes requiring authentication.
 * @param handler The actual handler to execute after authorization.
 */
// export function withAuth(handler: Handler) {
// 	return async (req: NextRequest) => {
// 		const token = req.headers.get('authorization')?.replace('Bearer ', '');

// 		// You can validate token (e.g., JWT verify) here
// 		if (!token) {
// 			return new NextResponse(JSON.stringify({ message: 'Unauthorized Access!' }), {
// 				status: 401,
// 			});
// 		}

// 		// Continue if authorized
// 		return handler(req);
// 	};
// }

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

/**
 * * Middleware to protect API routes by user role.
 * @param roles List of allowed roles.
 * @param handler The next handler to run if authorized.
 */
export function authorizeUser(roles: TUser['role'][], handler: Handler) {
	return async (req: NextRequest) => {
		const token = req.headers.get('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return new NextResponse(JSON.stringify({ message: 'Unauthorized Access!' }), {
				status: 401,
			});
		}

		const { _id } = verifyJwt(token);

		const user = await User.findById(_id);

		if (!user?.role || !roles.includes(user.role)) {
			return new NextResponse(JSON.stringify({ message: 'Forbidden Access!' }), {
				status: 403,
			});
		}

		const { password: _, ...userWithoutPass } = user.toObject();

		const extendedReq = extendRequest(req, { user: userWithoutPass });

		return handler(extendedReq);
	};
}
