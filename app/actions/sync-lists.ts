'use server';

import { cookies } from 'next/headers';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getTMDBLists, getTMDBListDetails, createTMDBList, addItemToTMDBList } from '@/lib/tmdb-user-lists';

/**
 * Sync TMDB lists to Supabase on login
 */
export async function syncTMDBListsToSupabase() {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			console.log('[syncTMDBLists] No user found');
			return { success: false, error: 'Not authenticated' };
		}

		// Get profile with TMDB ID
		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) {
			console.log('[syncTMDBLists] No profile found');
			return { success: false, error: 'Profile not found' };
		}

		// Get TMDB session
		const cookieStore = await cookies();
		const sessionId = cookieStore.get('tmdb_session_id')?.value;

		if (!sessionId) {
			console.log('[syncTMDBLists] No TMDB session');
			return { success: false, error: 'TMDB session missing' };
		}

		// Fetch TMDB lists
		console.log('[syncTMDBLists] Fetching TMDB lists for account:', profile.tmdb_id);
		const tmdbLists = await getTMDBLists(profile.tmdb_id, sessionId);

		console.log('[syncTMDBLists] Found', tmdbLists.length, 'TMDB lists');

		// Sync each list
		const adminSupabase = createAdminClient();
		let imported = 0;
		let updated = 0;

		for (const tmdbList of tmdbLists) {
			// Check if list already exists
			const { data: existingList } = await adminSupabase
				.from('user_lists')
				.select('id')
				.eq('tmdb_list_id', tmdbList.id.toString())
				.eq('user_id', profile.tmdb_id)
				.single();

			if (existingList) {
				// Update existing list
				await adminSupabase
					.from('user_lists')
					.update({
						name: tmdbList.name,
						description: tmdbList.description
					})
					.eq('id', existingList.id);
				updated++;
			} else {
				// Import new list
				const { data: newList, error } = await adminSupabase
					.from('user_lists')
					.insert({
						user_id: profile.tmdb_id,
						name: tmdbList.name,
						description: tmdbList.description,
						tmdb_list_id: tmdbList.id.toString()
					})
					.select('id')
					.single();

				if (error) {
					console.error('[syncTMDBLists] Error importing list:', error);
					continue;
				}

				// Fetch list items
				const listDetails = await getTMDBListDetails(tmdbList.id.toString());
				if (listDetails && listDetails.items && newList) {
					const items = listDetails.items.map((item: any) => ({
						list_id: newList.id,
						media_id: item.id,
						media_type: item.media_type || 'movie',
						title: item.title || item.name,
						poster_path: item.poster_path,
						added_at: new Date().toISOString()
					}));

					if (items.length > 0) {
						await adminSupabase
							.from('list_items')
							.insert(items);
					}
				}

				imported++;
			}
		}

		console.log(`[syncTMDBLists] Sync complete: ${imported} imported, ${updated} updated`);
		return { success: true, imported, updated };

	} catch (error) {
		console.error('[syncTMDBLists] Error:', error);
		return { success: false, error: String(error) };
	}
}
