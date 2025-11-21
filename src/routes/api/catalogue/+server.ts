import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const CopySchema = z.object({
	book_id: z.string().uuid(),
	location_id: z.string().uuid().optional(),
	barcode: z.string().optional(),
	status: z.enum(['available', 'checked_out', 'lost', 'damaged']).optional(),
	notes: z.string().optional()
});

export const GET: RequestHandler = async ({ url }) => {
	try {
		const orgId = getOrgId();
		const status = url.searchParams.get('status');

		let query = supabaseServer
			.from('copies')
			.select(
				`
				*,
				book:books!inner(*),
				location:locations(*)
			`
			)
			.eq('org_id', orgId)
			.is('deleted_at', null)
			.is('book.deleted_at', null);

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

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = CopySchema.parse(body);
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('copies')
			.insert({
				org_id: orgId,
				book_id: validated.book_id,
				location_id: validated.location_id || null,
				barcode: validated.barcode || null,
				status: validated.status || 'available',
				notes: validated.notes || null
			})
			.select()
			.single();

		if (error) throw error;

		return json({ data }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Validation error', details: error.errors }, { status: 400 });
		}
		console.error('Error creating copy:', error);
		return json({ error: 'Failed to create copy' }, { status: 500 });
	}
};
