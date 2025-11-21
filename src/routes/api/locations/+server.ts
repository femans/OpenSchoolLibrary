import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const LocationSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional()
});

export const GET: RequestHandler = async () => {
	try {
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('locations')
			.select('*')
			.eq('org_id', orgId)
			.is('deleted_at', null)
			.order('name');

		if (error) throw error;

		return json({ data });
	} catch (error) {
		console.error('Error fetching locations:', error);
		return json({ error: 'Failed to fetch locations' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = LocationSchema.parse(body);
		const orgId = getOrgId();

		const { data, error } = await supabaseServer
			.from('locations')
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
		console.error('Error creating location:', error);
		return json({ error: 'Failed to create location' }, { status: 500 });
	}
};
