import { ImageResponse } from 'next/og';
import { appIconImage } from '@/components/brand/appIcon';

// Icona per "Aggiungi alla schermata Home" su iPhone/iPad: full-bleed e
// opaca, gli angoli li arrotonda iOS.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
	return new ImageResponse(appIconImage(180), { ...size });
}
