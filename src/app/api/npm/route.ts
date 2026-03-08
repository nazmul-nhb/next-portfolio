import axios from 'axios';
import type { NextRequest } from 'next/server';
import { getTimestamp, pickFields } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { type PackageDetails, type PackageDlData, PKG_FIELDS } from '@/types/npm';

export async function GET(req: NextRequest) {
    try {
        const pkg = req.nextUrl.searchParams.get('package') || 'nhb-toolbox';
        const start = req.nextUrl.searchParams.get('start') || '2010-01-01';
        const end = req.nextUrl.searchParams.get('end') || getTimestamp().split('T')[0];

        const [downRes, pkgRes] = await Promise.all([
            axios.get<PackageDlData>(
                `https://api.npmjs.org/downloads/point/${start}:${end}/${pkg}`
            ),
            axios.get<PackageDetails>(`https://registry.npmjs.org/${pkg}`),
        ]);

        if (!pkgRes?.data || !downRes.data) {
            return sendErrorResponse(`Cannot find package: ${pkg} on npm`);
        }

        const data = pickFields(pkgRes.data, [...PKG_FIELDS]);

        return sendResponse(
            'N/A',
            'GET',
            { ...data, ...downRes.data },
            'Successfully retrieved package data!'
        );
    } catch (error) {
        return sendErrorResponse(error);
    }
}
