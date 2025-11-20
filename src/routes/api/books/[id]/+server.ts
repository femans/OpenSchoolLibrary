import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const orgId = getOrgId();
		const bookId = params.id;

		const { error } = await supabaseServer
			.from('books')
			.delete()
			.eq('id', bookId)
			.eq('org_id', orgId);

		if (error) throw error;

		return json({ message: 'Book deleted successfully' });
	} catch (error) {
		console.error('Error deleting book:', error);
		return json({ error: 'Failed to delete book' }, { status: 500 });
	}
};
