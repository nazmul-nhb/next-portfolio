import type { IUser } from '@/types/user.types';

import { type NextRequest } from 'next/server';

import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { authorizeUser } from '@/lib/api/middlewares';

export interface UserRequest extends NextRequest {
	user: IUser;
}

/** * Get current user */
export const GET = authorizeUser(['admin', 'visitor'], async (req: UserRequest) => {
	try {
		const user = req.user;

		return sendResponse('User', 'GET', user);
	} catch {
		return sendErrorResponse('No user found with the provided email!', 404);
	}
});
