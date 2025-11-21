import { json } from '@sveltejs/kit';
import { supabaseServer, getOrgId } from '$lib/server/supabaseServer';
import { z } from 'zod';
import type { RequestHandler } from './$types';

/**
 * CSV Import endpoint for bulk book/copy imports
 *
 * Expected CSV format:
 * title,authors,isbn,copies
 * "Book Title","Author 1; Author 2",9780140283334,3
 *
 * TODO: Add proper CSV parsing library in production (e.g., papaparse)
 */

const ImportSchema = z.object({
	csv: z.string().min(1)
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = ImportSchema.parse(body);
		const orgId = getOrgId();

		// Simple CSV parser (basic implementation)
		const lines = validated.csv.split('\n').filter((line) => line.trim());

		if (lines.length < 2) {
			return json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
		}

		const header = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[]
		};

		// Process each line
		for (let i = 1; i < lines.length; i++) {
			try {
				const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
				const row: Record<string, string> = {};

				header.forEach((key, idx) => {
					row[key] = values[idx] || '';
				});

				if (!row.title) {
					results.errors.push(`Line ${i + 1}: Missing title`);
					results.failed++;
					continue;
				}

				// Parse authors (semicolon-separated)
				const authors = row.authors ? row.authors.split(';').map((a) => a.trim()) : ['Unknown'];

				// Insert book
				const { data: book, error: bookError } = await supabaseServer
					.from('books')
					.insert({
						org_id: orgId,
						title: row.title,
						authors,
						isbn: row.isbn || null
					})
					.select()
					.single();

				if (bookError) {
					results.errors.push(`Line ${i + 1}: ${bookError.message}`);
					results.failed++;
					continue;
				}

				// Create copies if specified
				const copyCount = parseInt(row.copies || '1');
				if (copyCount > 0 && book) {
					const copies = Array(copyCount)
						.fill(null)
						.map(() => ({
							org_id: orgId,
							book_id: book.id,
							status: 'available' as const
						}));

					const { error: copiesError } = await supabaseServer.from('copies').insert(copies);

					if (copiesError) {
						results.errors.push(
							`Line ${i + 1}: Book created but copies failed: ${copiesError.message}`
						);
					}
				}

				results.success++;
			} catch (error) {
				results.errors.push(
					`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
				results.failed++;
			}
		}

		return json({ data: results });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Validation error', details: error.errors }, { status: 400 });
		}
		console.error('Error importing CSV:', error);
		return json({ error: 'Failed to import CSV' }, { status: 500 });
	}
};
