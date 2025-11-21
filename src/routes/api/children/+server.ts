import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { generateUniqueEmojiId } from '$lib/emojiGenerator';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const ChildSchema = z.object({
	name: z.string().optional(),
	grade_or_class: z.string().optional()
});

	export const GET: RequestHandler = async () => {
	try {
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('children')
			.select('*')
			.eq('org_id', orgId)
			.is('deleted_at', null)
			.order('created_at', { ascending: false });		if (error) throw error;

		return json({ data });
	} catch (error) {
		console.error('Error fetching children:', error);
		return json({ error: 'Failed to fetch children' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = ChildSchema.parse(body);
		const orgId = getOrgId();

		// Get existing emoji IDs to ensure uniqueness
		const { data: existing } = await supabaseServer
			.from('children')
			.select('emoji_id')
			.eq('org_id', orgId)
			.is('deleted_at', null);

		const existingIds = existing?.map(c => c.emoji_id) || [];
		const emojiId = generateUniqueEmojiId(existingIds);

		const { data, error } = await supabaseServer
			.from('children')
			.insert({
				org_id: orgId,
				emoji_id: emojiId,
				...validated
			})
			.select()
			.single();

		if (error) throw error;

		return json({ data }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Validation error', details: error.errors }, { status: 400 });
		}
		console.error('Error creating child:', error);
		return json({ error: 'Failed to create child' }, { status: 500 });
	}
};
