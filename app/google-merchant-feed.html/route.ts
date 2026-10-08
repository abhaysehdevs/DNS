import { GET as getXmlFeed } from '@/app/google-merchant-feed.xml/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    // Return standard Google Merchant Center XML feed
    return await getXmlFeed();
}
