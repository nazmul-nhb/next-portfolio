import type { TCredentials, TUser } from '@/types/user.types';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import sendResponse from '@/lib/actions/sendResponse';
import { verifyPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { signJwt } from '@/lib/jwt';
import { User } from '@/models/User';

/**
 * Login Route
 */
export async function POST(req: Request) {
	try {
		await connectDB();

		const { email, password } = (await req.json()) as TCredentials;

		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}

		const isValid = await verifyPassword(password, user.password);

		if (!isValid) {
			return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
		}

		const userData: TUser = user.toObject();

		const { password: _, ...userWithoutPassword } = userData;

		const token = signJwt(userWithoutPassword);

		const cookieStore = await cookies();

		cookieStore.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			sameSite: 'lax',
		});

		if (userData?._id) {
			return sendResponse('User', 'POST', userData, 'Login successful!');
		}
	} catch (error) {
		console.error(error);

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
