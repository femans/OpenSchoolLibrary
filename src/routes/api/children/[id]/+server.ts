import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { generateUniqueEmojiId } from '$lib/emojiGenerator';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const orgId = getOrgId();
		const childId = params.id;
		const body = await request.json();

		// If regenerating emoji ID
		if (body.regenerate_emoji) {
			// Get existing emoji IDs to ensure uniqueness
			const { data: existing } = await supabaseServer
				.from('children')
				.select('emoji_id')
				.eq('org_id', orgId)
				.is('deleted_at', null)
				.neq('id', childId); // Exclude current child

			const existingIds = existing?.map((c) => c.emoji_id) || [];
			const newEmojiId = generateUniqueEmojiId(existingIds);

			const { data, error } = await supabaseServer
				.from('children')
				.update({
					emoji_id: newEmojiId,
					updated_at: new Date().toISOString()
				})
				.eq('id', childId)
				.eq('org_id', orgId)
				.select()
				.single();

			if (error) throw error;

			return json({ data });
		}

		// If setting custom emoji ID
		if (body.custom_emoji_id) {
			const customEmojiId = body.custom_emoji_id.trim();

			// Validate: exactly 3 emojis
			const emojiRegex = /\p{Emoji}/gu;
			const emojis = customEmojiId.match(emojiRegex) || [];
			if (emojis.length !== 3) {
				return json({ error: 'Emoji ID must contain exactly 3 emojis' }, { status: 400 });
			}

			// Check if emoji ID already exists (excluding current child)
			const { data: existing } = await supabaseServer
				.from('children')
				.select('id')
				.eq('org_id', orgId)
				.eq('emoji_id', customEmojiId)
				.is('deleted_at', null)
				.neq('id', childId)
				.maybeSingle();

			if (existing) {
				return json(
					{ error: 'This emoji combination is already taken. Please choose different emojis.' },
					{ status: 409 }
				);
			}

			// Update with custom emoji ID
			const { data, error } = await supabaseServer
				.from('children')
				.update({
					emoji_id: customEmojiId,
					updated_at: new Date().toISOString()
				})
				.eq('id', childId)
				.eq('org_id', orgId)
				.select()
				.single();

			if (error) throw error;

			return json({ data });
		}

		return json({ error: 'Invalid request' }, { status: 400 });
	} catch (error) {
		console.error('Error updating child:', error);
		return json({ error: 'Failed to update child' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const orgId = getOrgId();
		const childId = params.id;

		const { error } = await supabaseServer
			.from('children')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', childId)
			.eq('org_id', orgId);

		if (error) throw error;

		return json({ message: 'Child deleted successfully' });
	} catch (error) {
		console.error('Error deleting child:', error);
		return json({ error: 'Failed to delete child' }, { status: 500 });
	}
};
