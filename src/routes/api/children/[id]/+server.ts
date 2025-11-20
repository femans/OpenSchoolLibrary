import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const orgId = getOrgId();
		const childId = params.id;

		const { error } = await supabaseServer
			.from('children')
			.delete()
			.eq('id', childId)
			.eq('org_id', orgId);

		if (error) throw error;

		return json({ message: 'Child deleted successfully' });
	} catch (error) {
		console.error('Error deleting child:', error);
		return json({ error: 'Failed to delete child' }, { status: 500 });
	}
};
