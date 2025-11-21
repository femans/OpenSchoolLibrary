import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const BookSchema = z.object({
	title: z.string().min(1),
	authors: z.array(z.string()).min(1),
	isbn: z.string().optional(),
	cover_url: z.string().url().optional().or(z.literal('')),
	metadata: z.record(z.unknown()).optional()
});

	export const GET: RequestHandler = async () => {
	try {
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('books')
			.select('*')
			.eq('org_id', orgId)
			.is('deleted_at', null)
			.order('title');		if (error) throw error;

		return json({ data });
	} catch (error) {
		console.error('Error fetching books:', error);
		return json({ error: 'Failed to fetch books' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = BookSchema.parse(body);
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('books')
			.insert({
				org_id: orgId,
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
		console.error('Error creating book:', error);
		return json({ error: 'Failed to create book' }, { status: 500 });
	}
};
