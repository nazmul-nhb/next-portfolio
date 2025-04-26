/**
 * * Wraps an async function to handle success and error responses consistently.
 * @param fn The async function to wrap
 * @returns A new async function returning { data, error }
 */
export function asyncWrapper<Args extends unknown[], Result, ApiError = unknown>(
	fn: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<{ data?: Result; error?: ApiError }> {
	return async (...args) => {
		try {
			const data = await fn(...args);

			return { data };
		} catch (error) {
			return { error: error as ApiError };
		}
	};
}
