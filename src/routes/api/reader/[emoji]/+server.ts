import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

/**
 * Public endpoint to get a child's reading journal by emoji ID.
 * No authentication required - this is intentionally public.
 */
export const GET: RequestHandler = async ({ params }) => {
	const emojiId = params.emoji;

	if (!emojiId) {
		return json({ error: 'Emoji ID required' }, { status: 400 });
	}

	try {
		const orgId = getOrgId();

		// Get child by emoji_id
		const { data: child, error: childError } = await supabaseServer
			.from('children')
			.select('*')
			.eq('org_id', orgId)
			.eq('emoji_id', emojiId)
			.is('deleted_at', null)
			.single();

		if (childError || !child) {
			return json({ error: 'Reader not found' }, { status: 404 });
		}

		// Get journal entries with book details
		const { data: entries, error: entriesError } = await supabaseServer
			.from('reading_journal')
			.select(`
				*,
				book:books!inner(*)
			`)
			.eq('org_id', orgId)
			.eq('child_id', child.id)
			.is('book.deleted_at', null)
			.order('created_at', { ascending: false });

		if (entriesError) {
			console.error('Error fetching journal entries:', entriesError);
			return json({ error: 'Error fetching journal entries' }, { status: 500 });
		}

		return json({
			data: {
				child,
				entries: entries || []
			}
		});
	} catch (error) {
		console.error('Error in reader endpoint:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
