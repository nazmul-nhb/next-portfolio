import type { TRegisterUser } from '@/types/user.types';

import { sendResponse } from '@/lib/actions/sendResponse';
import { hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { UserRegistrationSchema } from '@/schema/user.schema';
import { validateRequest } from '@/lib/actions/validateRequest';
import { sendErrorResponse } from '@/lib/actions/errorResponse';

/** * User Registration Route */
export async function POST(req: Request) {
	try {
		await connectDB();

		const userData: TRegisterUser = await req.json();

		const validated = await validateRequest(UserRegistrationSchema, userData);

		if (!validated.success) {
			return validated.response;
		}

		const exists = await User.findOne({ email: validated.data.email });

		if (exists) {
			return sendErrorResponse('User already exists with this email!', 409);
		}

		const hashed = await hashPassword(validated.data.password);

		const user = await User.create({
			...validated.data,
			password: hashed,
		});

		if (user?._id) {
			return sendResponse('User', 'POST', undefined, 'User created successfully!');
		}
	} catch (error) {
		console.error(error);

		return sendErrorResponse();
	}
}
