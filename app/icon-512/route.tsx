import { ImageResponse } from 'next/og';

export async function GET() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#f0a73a',
					color: '#1b1408',
					fontSize: 280,
					fontWeight: 800,
				}}
			>
				c
			</div>
		),
		{ width: 512, height: 512 }
	);
}
