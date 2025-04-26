import bcrypt from 'bcryptjs';

/**
 * Hash a plain password
 */
export async function hashPassword(password: string): Promise<string> {
	try {
		return bcrypt.hash(password, 10);
	} catch (error) {
		throw error;
	}
}

/**
 * Compare plain password with hashed password
 */
export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	try {
		return bcrypt.compare(password, hashedPassword);
	} catch (error) {
		console.error(error);

		return false;
	}
}
