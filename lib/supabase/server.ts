import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { SUPABASE_COOKIE_OPTIONS } from './config';

export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookieOptions: {
				name: SUPABASE_COOKIE_OPTIONS.name,
			},
			cookies: {
				getAll() {
					const all = cookieStore.getAll();
					console.log("Supabase Server Client Cookies:", all.map(c => c.name));
					return all;
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						)
					} catch {
						// The `setAll` method was called from a Server Component.
					}
				},
			},
		}
	)
}

// For routes that need admin access (sync operations)
export function createAdminClient() {
	const { createClient } = require('@supabase/supabase-js');

	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}
