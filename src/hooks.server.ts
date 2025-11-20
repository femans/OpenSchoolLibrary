import type { Handle } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

/**
 * Server hooks for SvelteKit.
 * Handles authentication state on every request.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Get the session from the cookie or token
	const session = event.cookies.get('sb-access-token');
	
	if (session) {
		// Set the session in the Supabase client
		const { data: { user } } = await supabase.auth.getUser(session);
		event.locals.user = user;
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
