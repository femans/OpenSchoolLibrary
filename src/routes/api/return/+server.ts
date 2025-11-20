import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const ReturnSchema = z.object({
	loan_id: z.string().uuid()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = ReturnSchema.parse(body);
		const orgId = getOrgId();

		// Get loan details
		const { data: loan, error: loanError } = await supabaseServer
			.from('loans')
			.select('*')
			.eq('id', validated.loan_id)
			.eq('org_id', orgId)
			.single();

		if (loanError || !loan) {
			return json({ error: 'Loan not found' }, { status: 404 });
		}

		if (loan.returned_at) {
			return json({ error: 'Book already returned' }, { status: 400 });
		}

		// Update loan with return date
		const { error: updateLoanError } = await supabaseServer
			.from('loans')
			.update({ returned_at: new Date().toISOString() })
			.eq('id', validated.loan_id);

		if (updateLoanError) throw updateLoanError;

		// Update copy status back to available
		const { error: updateCopyError } = await supabaseServer
			.from('copies')
			.update({ status: 'available', updated_at: new Date().toISOString() })
			.eq('id', loan.copy_id);

		if (updateCopyError) throw updateCopyError;

		return json({ message: 'Book returned successfully' });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Validation error', details: error.errors }, { status: 400 });
		}
		console.error('Error returning book:', error);
		return json({ error: 'Failed to return book' }, { status: 500 });
	}
};
