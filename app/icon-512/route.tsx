import { ImageResponse } from 'next/og';
import { appIconImage } from '@/components/brand/appIcon';

export async function GET() {
	return new ImageResponse(appIconImage(512), { width: 512, height: 512 });
}
