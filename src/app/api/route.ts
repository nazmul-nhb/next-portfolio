import sendResponse from '@/lib/actions/sendResponse';

export async function GET() {
    return sendResponse('N/A', 'GET', null, 'Portfolio Server is Running... 🏃🏼');
}
