import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SINGLE_ORG_MODE, SINGLE_ORG_ID } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a Supabase client for server-side operations with user's session.
 * This respects Row Level Security (RLS) policies.
 *
 * @param event - SvelteKit RequestEvent containing cookies
 * @returns Supabase client with user's session
 */
export function createServerClient(event: RequestEvent) {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			headers: {
				Authorization: event.request.headers.get('Authorization') || ''
			}
		},
		auth: {
			persistSession: false
		}
	});
}

/**
 * Legacy server client for backwards compatibility.
 * Note: Supabase is phasing out service_role keys in favor of RLS.
 * This now uses the anon key - ensure RLS policies are properly configured.
 */
export const supabaseServer = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

/**
 * Get the organization ID for the current context.
 * In single-org mode, returns the configured org ID.
 * In multi-tenant mode, would return the org ID from user session/context.
 */
export function getOrgId(): string {
	// TODO: In production, get org_id from authenticated user's metadata or org membership table
	// For now, check for single-org mode
	if (SINGLE_ORG_MODE === 'true' || SINGLE_ORG_ID) {
		return SINGLE_ORG_ID || '00000000-0000-0000-0000-000000000000';
	}

	throw new Error('Multi-tenant mode requires org_id from user context');
}
