import type { IUser } from '@/types/user.types';

import { NextResponse, type NextRequest } from 'next/server';

import { authorizeUser } from '@/lib/api/middlewares';
import sendResponse from '@/lib/actions/sendResponse';

export interface UserRequest extends NextRequest {
	user: IUser;
}

/** * Get current user */
export const GET = authorizeUser(['admin', 'visitor'], async (req: UserRequest) => {
	try {
		const user = req.user;

		return sendResponse('User', 'GET', user);
	} catch {
		return NextResponse.json(
			{ message: 'No user found with the provided email!' },
			{
				status: 404,
			}
		);
	}
});
