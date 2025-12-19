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

		const { data } = await supabase
			.from('user_lists')
			.select(`
            id, 
            name, 
            description, 
            created_at,
            items:list_items(count)
        `)
			.eq('user_id', profile.tmdb_id)
			.order('created_at', { ascending: false });

		const lists = data?.map(l => ({
			id: l.id,
			name: l.name,
			description: l.description,
			count: l.items?.[0]?.count || 0, // Approximate count logic needs fix if count is separate
			// Actually Supabase count is tricky. Let's assume list_items count. 
			// Better: select count of list_items.
		}));

		// Better query for count
		const { data: listsWithCount } = await supabase
			.from('user_lists')
			.select('*, list_items(count)')
			.eq('user_id', profile.tmdb_id);

		const formatted = listsWithCount?.map(l => ({
			id: l.id,
			name: l.name,
			description: l.description,
			count: l.list_items?.[0]?.count || 0
		}));

		return NextResponse.json(formatted || []);

	} catch (error) {
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

		const { name, description } = await request.json();

		const { data, error } = await supabase.from('user_lists').insert({
			user_id: profile.tmdb_id,
			name,
			description
		}).select().single();

		if (error) throw error;
		return NextResponse.json(data);
	} catch (e) {
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
