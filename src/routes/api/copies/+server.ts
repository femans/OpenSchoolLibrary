import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const orgId = getOrgId();
		const status = url.searchParams.get('status');

		let query = supabaseServer
			.from('copies')
			.select(`
				*,
				book:books(*),
				location:locations(*)
			`)
			.eq('org_id', orgId);

		if (status) {
			query = query.eq('status', status);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw error;

		return json({ data });
	} catch (error) {
		console.error('Error fetching copies:', error);
		return json({ error: 'Failed to fetch copies' }, { status: 500 });
	}
};
