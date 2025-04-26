import { NextResponse } from 'next/server';

import sendResponse from '@/lib/actions/sendResponse';
import { hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

/**
 * Register Route
 */
export async function POST(req: Request) {
	await connectDB();
	const { email, password } = await req.json();

	const exists = await User.findOne({ email });

	if (exists) {
		return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
	}

	const hashed = await hashPassword(password);

	const user = await User.create({
		email,
		password: hashed,
	});

	return sendResponse('User', 'POST', user, 'User created successfully!');
}
