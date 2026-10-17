import { ImageResponse } from 'next/og';
import { appIconImage } from '@/components/brand/appIcon';

// Favicon PNG per i browser che non usano icon.svg
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
	return new ImageResponse(appIconImage(32, 7), { ...size });
}
