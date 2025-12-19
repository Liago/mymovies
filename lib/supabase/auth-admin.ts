import { createAdminClient } from '@/lib/supabase/server';

interface TMDBUser {
	id: number;
	username: string;
	name: string;
	avatar: {
		tmdb: { avatar_path: string | null };
		gravatar: { hash: string | null };
	};
}

export async function linkSupabaseUser(tmdb_user: TMDBUser, tmdb_session: string) {
	try {
		if (!tmdb_user || !tmdb_session) {
			return { error: 'Missing TMDB credentials' };
		}

		const supabase = createAdminClient();

		// Create a unique email for this TMDB user
		const email = `tmdb_${tmdb_user.id}@cinescope.app`;

		// Try to find existing user by listing all users and filtering
		const { data: existingUsers } = await supabase.auth.admin.listUsers();
		const existingUser = existingUsers?.users.find((u: any) => u.email === email);

		let authUser;

		if (existingUser) {
			// User exists, just update metadata
			console.log('Updating existing Supabase user for TMDB ID:', tmdb_user.id);
			const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
				existingUser.id,
				{
					user_metadata: {
						tmdb_id: tmdb_user.id,
						tmdb_username: tmdb_user.username,
						tmdb_name: tmdb_user.name
					}
				}
			);

			if (updateError) {
				console.error('Error updating Supabase user:', updateError);
				return { error: 'Failed to update user' };
			}

			authUser = updateData.user;
		} else {
			// Create new user without password
			console.log('Creating new Supabase user for TMDB ID:', tmdb_user.id);
			const { data: createData, error: createError } = await supabase.auth.admin.createUser({
				email,
				email_confirm: true,
				user_metadata: {
					tmdb_id: tmdb_user.id,
					tmdb_username: tmdb_user.username,
					tmdb_name: tmdb_user.name
				}
			});

			if (createError) {
				console.error('Error creating Supabase user:', createError);
				return { error: 'Failed to create user' };
			}

			authUser = createData.user;
		}

		if (!authUser) {
			return { error: 'Authentication failed' };
		}

		// Create/update profile with auth_user_id link
		const avatar_url = tmdb_user.avatar.tmdb.avatar_path
			? `https://image.tmdb.org/t/p/w200${tmdb_user.avatar.tmdb.avatar_path}`
			: tmdb_user.avatar.gravatar.hash
				? `https://www.gravatar.com/avatar/${tmdb_user.avatar.gravatar.hash}`
				: null;

		await supabase.from('profiles').upsert({
			tmdb_id: tmdb_user.id,
			auth_user_id: authUser.id,
			username: tmdb_user.username,
			avatar_url
		}, { onConflict: 'tmdb_id' });

		// Generate a magic link for this user using admin SDK
		console.log('Generating magic link for user:', authUser.email);
		const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
			type: 'magiclink',
			email: authUser.email!,
		});

		if (linkError || !linkData?.properties?.hashed_token) {
			console.error('Error generating link:', linkError);
			return { error: 'Failed to generate link' };
		}

		// Verify the OTP to get actual session tokens
		console.log('Verifying OTP to create session');
		const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
			token_hash: linkData.properties.hashed_token,
			type: 'magiclink'
		});

		if (sessionError || !sessionData?.session) {
			console.error('Error verifying OTP:', sessionError);
			return { error: 'Failed to create session' };
		}

		console.log('Session created successfully');
		return {
			success: true,
			user: authUser,
			access_token: sessionData.session.access_token,
			refresh_token: sessionData.session.refresh_token
		};

	} catch (error) {
		console.error('Supabase auth error:', error);
		return { error: 'Internal server error' };
	}
}
