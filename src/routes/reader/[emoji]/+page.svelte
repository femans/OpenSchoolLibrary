<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Child, JournalEntryWithDetails } from '$lib/types';
	import { t } from '$lib/i18n';

	let emojiId = $page.params.emoji;
	let child: Child | null = null;
	let entries: JournalEntryWithDetails[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadReaderData();
	});

	async function loadReaderData() {
		loading = true;
		try {
			const response = await fetch(`/api/reader/${encodeURIComponent(emojiId)}`);
			const data = await response.json();
			
			if (response.ok) {
				child = data.data.child;
				entries = data.data.entries;
			} else {
				error = data.error || 'Reader not found';
			}
		} catch (err) {
			error = 'Error loading reader data';
			console.error(err);
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>{$t('reader.journal.title')} - {emojiId}</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if error}
		<div class="card text-center py-8">
			<p class="text-red-600 text-xl mb-4">❌ {error}</p>
			<p class="text-gray-600">{$t('reader.journal.enter_emoji')}</p>
		</div>
	{:else if child}
		<!-- Reader Header -->
		<div class="card mb-6 text-center">
			<h1 class="text-5xl mb-4">{child.emoji_id}</h1>
			{#if child.name}
				<h2 class="text-2xl font-semibold mb-2">{child.name}'s Reading Journal</h2>
			{:else}
				<h2 class="text-2xl font-semibold mb-2">My Reading Journal</h2>
			{/if}
			{#if child.grade_or_class}
				<p class="text-gray-600">{child.grade_or_class}</p>
			{/if}
		</div>

		<!-- Journal Entries -->
		<div class="card">
			<h3 class="text-xl font-semibold mb-4">{$t('reader.journal.your_books')} 📚</h3>
			
			{#if entries.length === 0}
				<div class="text-center py-8 text-gray-500">
					<p class="mb-2">{$t('reader.journal.no_books')}</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each entries as entry (entry.id)}
						<div class="border-b pb-4 last:border-b-0">
							{#if entry.book.cover_url}
								<img src={entry.book.cover_url} alt={entry.book.title} class="w-24 h-32 object-cover float-left mr-4 rounded" />
							{/if}
							<h4 class="font-semibold text-lg">{entry.book.title}</h4>
							<p class="text-sm text-gray-600 mb-2">by {entry.book.authors.join(', ')}</p>
							
							{#if entry.rating}
								<div class="mb-2">
									{#each Array(5) as _, i}
										<span class="text-2xl">{i < entry.rating ? '⭐' : '☆'}</span>
									{/each}
								</div>
							{/if}
							
							{#if entry.review}
								<p class="text-gray-700 italic">"{entry.review}"</p>
							{/if}
							
							{#if entry.read_date}
								<p class="text-xs text-gray-500 mt-2">
									Read on: {new Date(entry.read_date).toLocaleDateString()}
								</p>
							{/if}
							<div class="clear-both"></div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 gap-4 mt-6">
			<div class="card text-center">
				<p class="text-3xl font-bold text-blue-600">{entries.length}</p>
				<p class="text-sm text-gray-600">Books Read</p>
			</div>
			<div class="card text-center">
				<p class="text-3xl font-bold text-green-600">
					{entries.filter(e => e.rating).length > 0 
						? (entries.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / entries.filter(e => e.rating).length).toFixed(1)
						: '-'}
				</p>
				<p class="text-sm text-gray-600">Average Rating</p>
			</div>
		</div>
	{/if}
</div>
