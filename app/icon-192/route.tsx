import { ImageResponse } from 'next/og';
import { appIconImage } from '@/components/brand/appIcon';

export async function GET() {
	return new ImageResponse(appIconImage(192), { width: 192, height: 192 });
}
