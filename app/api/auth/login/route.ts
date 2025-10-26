import { getUserByEmail } from '@/lib/db-utils';
import { loginSchema } from '@/lib/validations';
import { signToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import type { ApiResponse, AuthResponse } from '@/lib/types';

export async function POST(req: Request): Promise<Response> {
	try {
		const body = await req.json();
		const validation = loginSchema.safeParse(body);

		if (!validation.success) {
			return Response.json(
				{
					success: false,
					error: validation.error.errors[0].message,
				} as ApiResponse<AuthResponse>,
				{ status: 400 }
			);
		}

		const { email, password } = validation.data;

		// Find user
		const user = await getUserByEmail(email);

		if (!user) {
			return Response.json(
				{
					success: false,
					error: 'Invalid credentials',
				} as ApiResponse<AuthResponse>,
				{ status: 401 }
			);
		}

		// Verify password
		const isPasswordValid = await verifyPassword(password, user.passwordHash);

		if (!isPasswordValid) {
			return Response.json(
				{
					success: false,
					error: 'Invalid credentials',
				} as ApiResponse<AuthResponse>,
				{ status: 401 }
			);
		}

		const token = await signToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		const response = Response.json({
			success: true,
			data: {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
				token,
			},
		} as ApiResponse<AuthResponse>);

		// response.cookies.set('auth_token', token, {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV === 'production',
		// 	sameSite: 'lax',
		// 	maxAge: 7 * 24 * 60 * 60, // 7 days
		// });

		return response;
	} catch (error) {
		console.error('[v0] Login error:', error);
		return Response.json(
			{
				success: false,
				error: 'Internal server error',
			} as ApiResponse<AuthResponse>,
			{ status: 500 }
		);
	}
}
