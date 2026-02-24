'use server';

import { cookies } from 'next/headers';
import { isBrowser } from 'nhb-toolbox';
import { siteConfig } from '@/configs/site';

/** * Builds headers with token from cookies if running on server */
export async function buildHeaders(headers?: HeadersInit) {
    if (isBrowser()) return headers || {};

    const cookieStore = await cookies();

    const token = cookieStore.get(siteConfig.tokenName)?.value;

    if (token) {
        return {
            ...(headers || {}),
            Authorization: `Bearer ${token}`,
        };
    }

    return headers || {};
}
