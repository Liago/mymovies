export default function NewsPage() {
	return (
		<main className="min-h-screen p-8 lg:p-12 flex flex-col items-center justify-center text-center">
			<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
					<path d="M18 14h-8"></path>
					<path d="M15 18h-5"></path>
					<path d="M10 6h8v4h-8V6Z"></path>
				</svg>
			</div>
			<h1 className="text-4xl font-bold mb-4 text-gray-900">Latest News</h1>
			<p className="text-gray-500 max-w-md">
				We're working on bringing you the latest updates from the world of cinema and television. Check back soon!
			</p>
		</main>
	);
}
