import { NextRequest, NextResponse } from 'next/server';
import { createSession, getAccountDetails } from '@/lib/tmdb-auth';
import { createServerClient } from '@supabase/ssr';
import { linkSupabaseUser } from '@/lib/supabase/auth-admin';
import { SUPABASE_COOKIE_OPTIONS } from '@/lib/supabase/config';

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


		// *** NEW: Create Supabase auth session directly ***
		try {
			console.log("Attempting to link Supabase user...");
			const result = await linkSupabaseUser(user, sessionId);

			if (result.success && result.access_token && result.refresh_token) {
				const { access_token, refresh_token } = result;
				console.log("Setting session with tokens:", { access_token: access_token.substring(0, 10), refresh_token: refresh_token.substring(0, 10) });

				// Use ssr client to correctly set cookies
				const supabase = createServerClient(
					process.env.NEXT_PUBLIC_SUPABASE_URL!,
					process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
					{
						cookieOptions: {
							name: SUPABASE_COOKIE_OPTIONS.name,
						},
						cookies: {
							getAll() {
								return request.cookies.getAll();
							},
							setAll(cookiesToSet) {
								console.log("Setting Supabase cookies count:", cookiesToSet.length);
								cookiesToSet.forEach(({ name, value, options }) => {
									console.log(`Setting cookie: ${name}`);
									response.cookies.set(name, value, options);
								});
							},
						},
					}
				);

				const { error: setSessionError } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				});

				if (setSessionError) {
					console.error("setSession error:", setSessionError);
				} else {
					console.log("Supabase setSession() completed");
				}
			} else {
				console.log("Supabase auth linking failed:", result.error);
			}
		} catch (supabaseError) {
			console.error('Supabase auth failed (non-fatal):', supabaseError);
		}

		return response;
	} catch (error) {
		console.error('Error in TMDB callback:', error);
		return NextResponse.redirect(new URL('/?auth_error=unknown', request.nextUrl.origin));
	}
}
