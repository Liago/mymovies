export const SUPABASE_COOKIE_OPTIONS = {
	name: 'sb-auth-token',
	lifetime: 60 * 60 * 24 * 7, // 7 days
	domain: '',
	path: '/',
	sameSite: 'lax'
};
