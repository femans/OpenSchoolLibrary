<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import type { Book, Location } from '$lib/types';

	let books: Book[] = [];
	let locations: Location[] = [];
	let loading = true;

	let formData = {
		book_id: '',
		location_id: '',
		barcode: '',
		status: 'available',
		notes: ''
	};

	onMount(async () => {
		await Promise.all([loadBooks(), loadLocations()]);
		loading = false;
	});

	async function loadBooks() {
		try {
			const response = await fetch('/api/books');
			const data = await response.json();
			books = data.data || [];
		} catch (error) {
			console.error('Error loading books:', error);
		}
	}

	async function loadLocations() {
		try {
			const response = await fetch('/api/locations');
			const data = await response.json();
			locations = data.data || [];
		} catch (error) {
			console.error('Error loading locations:', error);
		}
	}

		async function handleSubmit() {
		try {
			const response = await fetch('/api/catalogue', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					book_id: formData.book_id,
					location_id: formData.location_id || undefined,
					barcode: formData.barcode || undefined,
					status: formData.status,
					notes: formData.notes || undefined
				})
			});

			if (response.ok) {
				goto('/admin/catalogue');
			} else {
				const error = await response.json();
				alert($t('common.messages.error') + ': ' + error.error);
			}
		} catch (error) {
			alert($t('common.messages.error'));
		}
	}
</script>

<svelte:head>
	<title>{$t('admin.copies.add_copy')} - {$t('common.app.name')}</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<div class="mb-6">
		<a href="/admin/catalogue" class="text-blue-600 hover:underline">← {$t('common.actions.back')}</a>
	</div>

	<h1 class="text-3xl font-bold mb-6">{$t('admin.copies.add_copy')}</h1>

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else}
		<div class="card">
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="book" class="block text-sm font-medium mb-1">{$t('admin.copies.book')} *</label>
					<select id="book" bind:value={formData.book_id} class="input" required>
						<option value="">{$t('admin.copies.select_book')}</option>
						{#each books as book (book.id)}
							<option value={book.id}>{book.title} {book.authors.length > 0 ? `by ${book.authors.join(', ')}` : ''}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="location" class="block text-sm font-medium mb-1">{$t('admin.copies.location')}</label>
					<select id="location" bind:value={formData.location_id} class="input">
						<option value="">{$t('admin.copies.select_location')}</option>
						{#each locations as location (location.id)}
							<option value={location.id}>{location.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="barcode" class="block text-sm font-medium mb-1">{$t('admin.copies.barcode')}</label>
					<input id="barcode" bind:value={formData.barcode} class="input" placeholder="{$t('admin.copies.barcode')}" />
				</div>

				<div>
					<label for="status" class="block text-sm font-medium mb-1">{$t('admin.copies.status')} *</label>
					<select id="status" bind:value={formData.status} class="input" required>
						<option value="available">{$t('common.status.available')}</option>
						<option value="checked_out">{$t('common.status.checked_out')}</option>
						<option value="lost">{$t('common.status.lost')}</option>
						<option value="damaged">{$t('common.status.damaged')}</option>
					</select>
				</div>

				<div>
					<label for="notes" class="block text-sm font-medium mb-1">{$t('admin.copies.notes')}</label>
					<textarea id="notes" bind:value={formData.notes} class="input" rows="3" placeholder="{$t('admin.copies.notes')}"></textarea>
				</div>

				<div class="flex space-x-2">
					<button type="submit" class="btn btn-primary">{$t('common.actions.save')}</button>
					<a href="/admin/catalogue" class="btn btn-secondary">{$t('common.actions.cancel')}</a>
				</div>
			</form>
		</div>
	{/if}
</div>
