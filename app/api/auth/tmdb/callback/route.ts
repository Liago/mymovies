import { NextRequest, NextResponse } from 'next/server';
import { createSession, getAccountDetails } from '@/lib/tmdb-auth';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
	try {
		// Get the approved request token from query params
		const requestToken = request.nextUrl.searchParams.get('request_token');
		const approved = request.nextUrl.searchParams.get('approved');

		if (!requestToken) {
			// Redirect to home with error
			return NextResponse.redirect(new URL('/?auth_error=missing_token', request.nextUrl.origin));
		}

		if (approved === 'false') {
			// User denied the request
			return NextResponse.redirect(new URL('/?auth_error=denied', request.nextUrl.origin));
		}

		// Step 3: Create a session with the approved token
		const sessionId = await createSession(requestToken);

		if (!sessionId) {
			return NextResponse.redirect(new URL('/?auth_error=session_failed', request.nextUrl.origin));
		}

		// Get user details
		const user = await getAccountDetails(sessionId);

		if (!user) {
			return NextResponse.redirect(new URL('/?auth_error=user_fetch_failed', request.nextUrl.origin));
		}

		// Create response with redirect to home
		const response = NextResponse.redirect(new URL('/', request.nextUrl.origin));

		// Set session data in cookies (httpOnly for security)
		response.cookies.set('tmdb_session_id', sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			path: '/',
		});

		// Store user info in a separate cookie (not httpOnly so client can read it)
		response.cookies.set('tmdb_user', JSON.stringify({
			id: user.id,
			username: user.username,
			name: user.name,
			avatar: user.avatar,
		}), {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			path: '/',
		});

		// *** NEW: Create Supabase auth session ***
		try {
			const supabaseAuthResponse = await fetch(new URL('/api/auth/supabase', request.nextUrl.origin), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tmdb_user: user,
					tmdb_session: sessionId
				})
			});

			if (supabaseAuthResponse.ok) {
				const { access_token, refresh_token } = await supabaseAuthResponse.json();

				// Use ssr client to correctly set cookies
				if (access_token && refresh_token) {
					const supabase = createServerClient(
						process.env.NEXT_PUBLIC_SUPABASE_URL!,
						process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
						{
							cookies: {
								getAll() {
									return request.cookies.getAll();
								},
								setAll(cookiesToSet) {
									console.log("Setting Supabase cookies in callback:", cookiesToSet.map(c => c.name));
									cookiesToSet.forEach(({ name, value, options }) =>
										response.cookies.set(name, value, options)
									);
								},
							},
						}
					);

					await supabase.auth.setSession({
						access_token,
						refresh_token,
					});
					console.log("Supabase session set successfully in callback");
				} else {
					console.log("Missing access/refresh token from Supabase auth endpoint");
				}
			} else {
				console.log("Supabase auth endpoint returned failed status", await supabaseAuthResponse.clone().text());
			}
		} catch (supabaseError) {
			console.error('Supabase auth failed (non-fatal):', supabaseError);
			// Continue anyway - user will use TMDB auth
		}

		return response;
	} catch (error) {
		console.error('Error in TMDB callback:', error);
		return NextResponse.redirect(new URL('/?auth_error=unknown', request.nextUrl.origin));
	}
}
