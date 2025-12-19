import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: listId } = await params;
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = await request.json();
		const { id: mediaId, media_type, title, poster } = body;

		const { error } = await supabase.from('list_items').insert({
			list_id: listId,
			media_id: mediaId,
			media_type,
			title,
			poster_path: poster
		});

		if (error) throw error;
		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ error: 'Failed' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: listId } = await params;
		const itemId = request.nextUrl.searchParams.get('id');
		const type = request.nextUrl.searchParams.get('type');

		const supabase = await createClient();
		const { error } = await supabase.from('list_items').delete().match({
			list_id: listId,
			media_id: itemId,
			media_type: type
		});

		if (error) throw error;
		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ error: 'Failed' }, { status: 500 });
	}
}
