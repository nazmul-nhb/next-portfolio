import axios from 'axios';
import type { NextRequest } from 'next/server';
import { getTimestamp, pickFields } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { NPM_START, PKG_FIELDS } from '@/lib/constants';
import type { PackageDetails, PackageDlData } from '@/types/npm';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const pkg = searchParams.get('package') || 'nhb-toolbox';
        const start = searchParams.get('start') || NPM_START;
        const end = searchParams.get('end') || getTimestamp().split('T')[0];

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
