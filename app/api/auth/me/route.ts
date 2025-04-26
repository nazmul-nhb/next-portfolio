import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyJwt } from '@/lib/jwt';

/**
 * Get current user
 */
export async function GET() {
	const cookieStore = await cookies();

	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ user: null });
	}

	try {
		const user = verifyJwt(token);

		return NextResponse.json({ user });
	} catch {
		return NextResponse.json({ user: null });
	}
}
