import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const orgId = getOrgId();
		const filter = url.searchParams.get('filter') || 'all';

		let query = supabaseServer
			.from('loans')
			.select(
				`
				*,
				copy:copies(
					*,
					book:books(*)
				),
				child:children(*)
			`
			)
			.eq('org_id', orgId);

		if (filter === 'active') {
			query = query.is('returned_at', null);
		} else if (filter === 'returned') {
			query = query.not('returned_at', 'is', null);
		}

		const { data, error } = await query.order('checked_out_at', { ascending: false });

		if (error) throw error;

		return json({ data });
	} catch (error) {
		console.error('Error fetching loans:', error);
		return json({ error: 'Failed to fetch loans' }, { status: 500 });
	}
};
