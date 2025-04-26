import type { ServerResponse, TMethod } from '@/types';
import type { QueryObject } from 'nhb-toolbox/object/types';

import { formatQueryParams } from 'nhb-toolbox';

import { siteConfig } from '@/config/site';

interface options<TBody = unknown> {
	method?: TMethod;
	body?: TBody;
	query?: QueryObject;
	headers?: HeadersInit;
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
}

/**
 * * Performs an HTTP request with standard options.
 * @param endpoint API endpoint or URL
 * @param options Configuration options for the request
 * @returns JSON-parsed response
 */
export async function httpRequest<R = void, B = void>(
	endpoint: string,
	options: options<B> = {}
): Promise<ServerResponse<R>> {
	const { method = 'GET', body, query, headers, cache = 'default', next } = options;

	const queryString = formatQueryParams(query);

	const fullEndpoint = endpoint.startsWith('http')
		? endpoint
		: siteConfig.baseUrl.concat(endpoint);

	const url = queryString ? fullEndpoint.concat(queryString) : fullEndpoint;

	const response = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(headers || {}),
		},
		cache,
		next,
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
