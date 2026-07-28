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
					background: '#6366f1',
					color: '#ffffff',
					fontSize: 280,
					fontWeight: 700,
				}}
			>
				M
			</div>
		),
		{ width: 512, height: 512 }
	);
}
