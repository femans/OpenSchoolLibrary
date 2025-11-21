import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface OpenLibraryAuthor {
	name: string;
	url?: string;
}

interface OpenLibrarySubject {
	name: string;
	url?: string;
}

interface OpenLibraryPublisher {
	name: string;
}

interface OpenLibraryBook {
	title?: string;
	authors?: OpenLibraryAuthor[];
	cover?: {
		small?: string;
		medium?: string;
		large?: string;
	};
	publishers?: OpenLibraryPublisher[];
	publish_date?: string;
	number_of_pages?: number;
	subjects?: OpenLibrarySubject[];
}

/**
 * ISBN lookup endpoint - proxies requests to OpenLibrary API
 * Usage: /api/isbn?isbn=9780140283334
 */
export const GET: RequestHandler = async ({ url }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN parameter required' }, { status: 400 });
	}

	try {
		// Clean ISBN (remove hyphens and spaces)
		const cleanIsbn = isbn.replace(/[-\s]/g, '');

		// Query OpenLibrary API
		const response = await fetch(
			`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
		);

		if (!response.ok) {
			throw new Error('OpenLibrary API request failed');
		}

		const data: Record<string, OpenLibraryBook> = await response.json();
		const bookKey = `ISBN:${cleanIsbn}`;
		const bookData = data[bookKey];

		if (!bookData) {
			return json({ error: 'Book not found' }, { status: 404 });
		}

		// Transform OpenLibrary data to our format
		const transformedData = {
			title: bookData.title || '',
			authors: bookData.authors?.map((a) => a.name) || [],
			isbn: cleanIsbn,
			cover_url: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || '',
			metadata: {
				publisher: bookData.publishers?.[0]?.name || '',
				publish_date: bookData.publish_date || '',
				number_of_pages: bookData.number_of_pages || null,
				subjects: bookData.subjects?.map((s) => s.name) || []
			}
		};

		return json({ data: transformedData });
	} catch (error) {
		console.error('Error looking up ISBN:', error);
		return json({ error: 'Failed to lookup ISBN' }, { status: 500 });
	}
};
