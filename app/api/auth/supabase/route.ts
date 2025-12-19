import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * This endpoint creates/authenticates a Supabase user when TMDB login succeeds
 * Called automatically after TMDB authentication
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { tmdb_user, tmdb_session } = body;

		if (!tmdb_user || !tmdb_session) {
			return NextResponse.json({ error: 'Missing TMDB credentials' }, { status: 400 });
		}

		// Use admin client to create/update user
		const supabase = createAdminClient();

		// Create a unique email for this TMDB user
		const email = `tmdb_${tmdb_user.id}@cinescope.app`;
		const password = tmdb_session; // Use session as password (hashed by Supabase)

		// Try to sign in first
		let authUser;
		let session;

		const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (signInError) {
			// User doesn't exist, create it
			const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
				email,
				password,
				email_confirm: true,
				user_metadata: {
					tmdb_id: tmdb_user.id,
					tmdb_username: tmdb_user.username,
					tmdb_name: tmdb_user.name
				}
			});

			if (signUpError) {
				console.error('Error creating Supabase user:', signUpError);
				return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
			}

			authUser = signUpData.user;

			// Sign in the new user to get the session
			const { data: newSessionData } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			session = newSessionData.session;
		} else {
			authUser = signInData.user;
			session = signInData.session;
		}

		if (!authUser || !session) {
			return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
		}

		// Create/update profile with auth_user_id link
		const avatar_url = tmdb_user.avatar.tmdb.avatar_path
			? `https://image.tmdb.org/t/p/w200${tmdb_user.avatar.tmdb.avatar_path}`
			: tmdb_user.avatar.gravatar.hash
				? `https://www.gravatar.com/avatar/${tmdb_user.avatar.gravatar.hash}`
				: null;

		await supabase.from('profiles').upsert({
			tmdb_id: tmdb_user.id,
			auth_user_id: authUser.id, // Link to Supabase auth
			username: tmdb_user.username,
			avatar_url
		}, { onConflict: 'tmdb_id' });

		return NextResponse.json({
			success: true,
			user: authUser,
			access_token: session.access_token,
			refresh_token: session.refresh_token
		});

	} catch (error) {
		console.error('Supabase auth error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
