'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const requestToken = searchParams.get('request_token');
		const approved = searchParams.get('approved');
		const denied = searchParams.get('denied');

		if (denied === 'true' || approved === 'false') {
			setError('Autorizzazione negata. Reindirizzamento alla home...');
			setTimeout(() => router.push('/'), 2000);
			return;
		}

		if (!requestToken) {
			setError('Token mancante. Reindirizzamento alla home...');
			setTimeout(() => router.push('/'), 2000);
			return;
		}

		// Redirect to the API route which will handle creating the session
		window.location.href = `/api/auth/tmdb/callback?request_token=${requestToken}&approved=true`;
	}, [searchParams, router]);

	return (
		<div className="text-center">
			{error ? (
				<div className="text-red-400 text-lg">{error}</div>
			) : (
				<>
					<Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
					<p className="text-white text-lg">Autenticazione in corso...</p>
					<p className="text-gray-400 text-sm mt-2">Stai per essere reindirizzato</p>
				</>
			)}
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="text-center">
			<Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
			<p className="text-white text-lg">Caricamento...</p>
		</div>
	);
}

export default function TMDBCallbackPage() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<Suspense fallback={<LoadingFallback />}>
				<CallbackContent />
			</Suspense>
		</div>
	);
}

