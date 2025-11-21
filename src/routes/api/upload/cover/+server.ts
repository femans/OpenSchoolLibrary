import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabaseServer';
import type { RequestHandler } from './$types';

/**
 * Cover upload endpoint using Supabase Storage
 *
 * TODO: Implement file upload handling
 * This is a placeholder showing the pattern.
 * In production, use proper multipart form handling.
 */
export const POST: RequestHandler = async ({ request: _request }) => {
	try {
		// TODO: Parse multipart form data
		// const formData = await request.formData();
		// const file = formData.get('file') as File;

		return json(
			{
				error: 'Cover upload not yet implemented',
				message: 'TODO: Implement file upload with Supabase Storage or use signed URLs'
			},
			{ status: 501 }
		);

		// Example implementation:
		// const { data, error } = await supabaseServer.storage
		// 	.from('book-covers')
		// 	.upload(`${Date.now()}-${file.name}`, file);
		//
		// if (error) throw error;
		//
		// const { data: { publicUrl } } = supabaseServer.storage
		// 	.from('book-covers')
		// 	.getPublicUrl(data.path);
		//
		// return json({ data: { url: publicUrl } });
	} catch (error) {
		console.error('Error uploading cover:', error);
		return json({ error: 'Failed to upload cover' }, { status: 500 });
	}
};

/**
 * Alternative: Generate signed URL for client-side upload
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const filename = url.searchParams.get('filename');

		if (!filename) {
			return json({ error: 'Filename required' }, { status: 400 });
		}

		// Generate signed URL for client-side upload
		const path = `${Date.now()}-${filename}`;
		const { data, error } = await supabaseServer.storage
			.from('book-covers')
			.createSignedUploadUrl(path);

		if (error) throw error;

		return json({
			data: {
				signedUrl: data.signedUrl,
				path: data.path
			}
		});
	} catch (error) {
		console.error('Error generating signed URL:', error);
		return json({ error: 'Failed to generate upload URL' }, { status: 500 });
	}
};
