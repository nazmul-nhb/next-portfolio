import type { TRegisterUser } from '@/types/user.types';

import { NextResponse } from 'next/server';

import sendResponse from '@/lib/actions/sendResponse';
import { hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

/**
 * Register Route
 */
export async function POST(req: Request) {
	try {
		await connectDB();
		const userData: TRegisterUser = await req.json();

		const exists = await User.findOne({ email: userData.email });

		if (exists) {
			return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
		}

		const hashed = await hashPassword(userData.password);

		const user = await User.create({
			...userData,
			password: hashed,
		});

		if (user?._id) {
			return sendResponse('User', 'POST', undefined, 'User created successfully!');
		}
	} catch (error) {
		console.error(error);

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
