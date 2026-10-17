/**
 * Icona dell'app: la "c" del logo cinescope come un arco bianco, con il
 * punto ambra nell'apertura (come un proiettore acceso) su fondo scuro.
 * Pensata full-bleed su 512×512: il contenuto resta nella safe zone delle
 * icone "maskable" e iOS applica da solo gli angoli arrotondati.
 */
export const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
	<defs>
		<radialGradient id="bg" cx="30%" cy="22%" r="95%">
			<stop offset="0" stop-color="#2c241b"/>
			<stop offset="0.55" stop-color="#151416"/>
			<stop offset="1" stop-color="#0e0e10"/>
		</radialGradient>
		<radialGradient id="glow" cx="50%" cy="50%" r="50%">
			<stop offset="0" stop-color="#f0a73a" stop-opacity="0.55"/>
			<stop offset="1" stop-color="#f0a73a" stop-opacity="0"/>
		</radialGradient>
		<linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#ffffff"/>
			<stop offset="1" stop-color="#e9e6e1"/>
		</linearGradient>
	</defs>
	<rect width="512" height="512" fill="url(#bg)"/>
	<circle cx="380" cy="256" r="104" fill="url(#glow)"/>
	<path d="M 340.5 165.5 A 128 128 0 1 0 340.5 346.5" fill="none" stroke="url(#ring)" stroke-width="64" stroke-linecap="round"/>
	<circle cx="380" cy="256" r="34" fill="#f0a73a"/>
</svg>`;

/** Data URL dell'icona, per ImageResponse (PNG per iOS, Android e browser). */
export const APP_ICON_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(APP_ICON_SVG).toString('base64')}`;

/** Contenuto JSX per `ImageResponse` alla dimensione richiesta. */
export function appIconImage(size: number, radius = 0) {
	return (
		<div style={{ width: '100%', height: '100%', display: 'flex', borderRadius: radius, overflow: 'hidden' }}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={APP_ICON_DATA_URL} width={size} height={size} alt="" />
		</div>
	);
}
