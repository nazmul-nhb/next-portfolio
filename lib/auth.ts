import bcrypt from 'bcryptjs';

/**
 * * Utility function to hash password using `bcrypt`.
 * @param password Password to hash.
 * @returns Hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
	try {
		return await bcrypt.hash(password, 10);
	} catch (error) {
		throw error;
	}
}

/**
 * * Utility function to compare incoming password with hashed password.
 * @param rawPassword Incoming password from client.
 * @param hashedPassword Password from DB to be compared with.
 * @returns `true` if password is matched, otherwise `false`.
 */
export async function verifyPassword(
	rawPassword: string,
	hashedPassword: string
): Promise<boolean> {
	try {
		return await bcrypt.compare(rawPassword, hashedPassword);
	} catch (error) {
		console.error(error);

		return false;
	}
}
