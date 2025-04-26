import type { ServerResponse, TMethod } from '@/types';
import type { QueryObject } from 'nhb-toolbox/object/types';

import { formatQueryParams } from 'nhb-toolbox';

import { siteConfig } from '@/config/site';

interface Options<Body = unknown> extends Omit<RequestInit, 'body'> {
	method?: TMethod;
	body?: Body;
	query?: QueryObject;
}

/**
 * * Performs an HTTP request with standard options.
 * @param endpoint API endpoint or URL
 * @param options Configuration options for the request
 * @returns JSON-parsed response
 */
export async function httpRequest<R = void, B = void>(
	endpoint: string,
	options: Options<B> = {}
): Promise<ServerResponse<R>> {
	const { method = 'GET', body, query, headers, ...restOptions } = options;

	const queryString = formatQueryParams(query);

	// const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);

	// const fullEndpoint = isAbsoluteUrl ? endpoint : siteConfig.baseUrl.concat(endpoint);

	// const url = queryString ? fullEndpoint.concat(queryString) : fullEndpoint;

	const url = buildUrl(endpoint, queryString);

	const response = await fetch(url, {
		method,
		...restOptions,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(headers || {}),
		},
		...(body && { body: JSON.stringify(body) }),
	});

	if (!response.ok) {
		const errorBody = await response.json();

		throw {
			success: false,
			message:
				errorBody?.message ||
				`Request failed: ${response.status} ${response.statusText}`,
			status: response?.status || 500,
			errors: errorBody?.errors || {},
		};
	}

	return response.json() as Promise<ServerResponse<R>>;
}

/**
 * Builds a full URL based on environment (server/client) and endpoint.
 * @param endpoint The API endpoint (relative or absolute).
 * @param queryString Optional query string to append.
 * @returns Full URL ready for fetch
 */
function buildUrl(endpoint: string, queryString = ''): string {
	const isServer = typeof window === 'undefined';

	const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);

	if (isAbsoluteUrl) {
		return endpoint.concat(queryString);
	}

	if (isServer) {
		// On server, need absolute URL
		return siteConfig.baseUrl.concat(endpoint).concat(queryString);
	}

	// On client, relative URL is fine
	return endpoint.concat(queryString);
}
