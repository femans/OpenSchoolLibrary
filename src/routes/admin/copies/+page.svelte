<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import type { CopyWithBook } from '$lib/types';

	let copies: CopyWithBook[] = [];
	let loading = true;

	onMount(async () => {
		await loadCopies();
	});

	async function loadCopies() {
		loading = true;
		try {
			const response = await fetch('/api/copies');
			const data = await response.json();
			copies = data.data || [];
		} catch (error) {
			console.error('Error loading copies:', error);
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>{$t('admin.copies.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">{$t('admin.copies.title')}</h1>
		<a href="/admin/copies/add" class="btn btn-primary">{$t('admin.copies.add_copy')}</a>
	</div>

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if copies.length === 0}
		<div class="card text-center py-8 text-gray-500">
			<p>{$t('admin.copies.no_copies')}</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="bg-gray-100">
						<th class="px-4 py-2 text-left">{$t('admin.books.book_title')}</th>
						<th class="px-4 py-2 text-left">{$t('admin.copies.status')}</th>
						<th class="px-4 py-2 text-left">{$t('admin.copies.barcode')}</th>
						<th class="px-4 py-2 text-left">{$t('admin.copies.location')}</th>
					</tr>
				</thead>
				<tbody>
					{#each copies as copy (copy.id)}
						<tr class="border-b hover:bg-gray-50">
							<td class="px-4 py-3">{copy.book.title}</td>
							<td class="px-4 py-3">
								<span class="px-2 py-1 rounded text-sm" class:bg-green-100={copy.status === 'available'}
									class:bg-orange-100={copy.status === 'checked_out'}
									class:bg-red-100={copy.status === 'lost' || copy.status === 'damaged'}>
									{$t(`common.status.${copy.status}`)}
								</span>
							</td>
							<td class="px-4 py-3">{copy.barcode || '-'}</td>
							<td class="px-4 py-3">{copy.location?.name || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
