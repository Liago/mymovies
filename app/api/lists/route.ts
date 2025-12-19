import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json([], { status: 200 });
		}

		const { data: profile } = await supabase.from('profiles').select('tmdb_id').eq('auth_user_id', user.id).single();
		if (!profile) return NextResponse.json([], { status: 200 });

		// Get lists with item count
		const { data: userLists, error } = await supabase
			.from('user_lists')
			.select(`
				id,
				name,
				description,
				created_at
			`)
			.eq('user_id', profile.tmdb_id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('[API /lists] Query error:', error);
			throw error;
		}

		// For each list, count items separately
		const listsWithCounts = await Promise.all(
			(userLists || []).map(async (list) => {
				const { count } = await supabase
					.from('list_items')
					.select('*', { count: 'exact', head: true })
					.eq('list_id', list.id);

				return {
					id: list.id,
					name: list.name,
					description: list.description,
					count: count || 0
				};
			})
		);

		console.log('[API /lists] Returning lists:', listsWithCounts.length);
		return NextResponse.json(listsWithCounts);

	} catch (error) {
		console.error('[API /lists] Error:', error);
		return NextResponse.json({ error: 'Failed' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { data: profile } = await supabase.from('profiles').select('tmdb_id').eq('auth_user_id', user.id).single();
		if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 });

		const { name, description, tmdb_list_id } = await request.json();

		const { data, error } = await supabase.from('user_lists').insert({
			user_id: profile.tmdb_id,
			name,
			description,
			tmdb_list_id: tmdb_list_id || null
		}).select().single();

		if (error) {
			console.error('[API /lists POST] Error:', error);
			throw error;
		}

		const formatted = {
			id: data.id,
			name: data.name,
			description: data.description,
			count: 0
		};

		console.log('[API /lists POST] Created list:', formatted);
		return NextResponse.json(formatted);
	} catch (e) {
		console.error('[API /lists POST] Failed:', e);
		return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	const supabase = await createClient();
	const id = request.nextUrl.searchParams.get('id');
	const { error } = await supabase.from('user_lists').delete().eq('id', id); // RLS protects
	if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 });
	return NextResponse.json({ success: true });
}
