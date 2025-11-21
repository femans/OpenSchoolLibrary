import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const CheckoutSchema = z.object({
	copy_id: z.string().uuid(),
	child_id: z.string().uuid().optional(),
	borrower_name: z.string().optional(),
	borrower_class: z.string().optional(),
	notes: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = CheckoutSchema.parse(body);
		const orgId = getOrgId();

		// Verify copy exists and is available
		const { data: copy, error: copyError } = await supabaseServer
			.from('copies')
			.select('*')
			.eq('id', validated.copy_id)
			.eq('org_id', orgId)
			.is('deleted_at', null)
			.single();

		if (copyError || !copy) {
			return json({ error: 'Copy not found' }, { status: 404 });
		}

		if (copy.status !== 'available') {
			return json({ error: 'Copy is not available' }, { status: 400 });
		}

		// Create loan
		const { data: loan, error: loanError } = await supabaseServer
			.from('loans')
			.insert({
				org_id: orgId,
				copy_id: validated.copy_id,
				child_id: validated.child_id || null,
				borrower_name: validated.borrower_name || null,
				borrower_class: validated.borrower_class || null,
				notes: validated.notes || null
			})
			.select()
			.single();

		if (loanError) throw loanError;

		// Update copy status
		const { error: updateError } = await supabaseServer
			.from('copies')
			.update({ status: 'checked_out', updated_at: new Date().toISOString() })
			.eq('id', validated.copy_id);

		if (updateError) throw updateError;

		return json({ data: loan }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Validation error', details: error.errors }, { status: 400 });
		}
		console.error('Error checking out book:', error);
		return json({ error: 'Failed to checkout book' }, { status: 500 });
	}
};
