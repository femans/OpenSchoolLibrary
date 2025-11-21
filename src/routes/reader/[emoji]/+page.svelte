<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Child, JournalEntryWithDetails } from '$lib/types';
	import { t } from '$lib/i18n';
	import EmojiPicker from '$lib/components/EmojiPicker.svelte';

	let emojiId = $page.params.emoji;
	let child: Child | null = null;
	let entries: JournalEntryWithDetails[] = [];
	let loading = true;
	let error = '';
	let regenerating = false;
	let showEmojiPicker = false;
	let selectedEmojis: string[] = [];
	let takenEmojiIds: string[] = [];

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

	async function regenerateEmojiId() {
		if (!child || !confirm('Are you sure you want to generate a new emoji ID? This will change your personal identifier.')) {
			return;
		}

		regenerating = true;
		try {
			const response = await fetch(`/api/children/${child.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ regenerate_emoji: true })
			});

			if (response.ok) {
				const data = await response.json();
				const newEmojiId = data.data.emoji_id;
				// Update the local state
				child.emoji_id = newEmojiId;
				emojiId = newEmojiId;
				// Update the URL without reloading
				window.history.pushState({}, '', `/reader/${newEmojiId}`);
			} else {
				alert('Failed to regenerate emoji ID. Please try again.');
			}
		} catch (err) {
			console.error('Error regenerating emoji ID:', err);
			alert('Error regenerating emoji ID');
		}
		regenerating = false;
	}

	async function setCustomEmojiId() {
		if (!child || selectedEmojis.length !== 3) {
			return;
		}

		regenerating = true;
		const newEmojiId = selectedEmojis.join('');

		try {
			const response = await fetch(`/api/children/${child.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					custom_emoji_id: newEmojiId
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Update the local state
				child.emoji_id = data.data.emoji_id;
				emojiId = data.data.emoji_id;
				// Update the URL without reloading
				window.history.pushState({}, '', `/reader/${data.data.emoji_id}`);
				// Reset picker
				showEmojiPicker = false;
				selectedEmojis = [];
			} else {
				const errorData = await response.json();
				alert(errorData.error || 'Failed to set custom emoji ID. It might already be taken.');
			}
		} catch (err) {
			console.error('Error setting custom emoji ID:', err);
			alert('Error setting custom emoji ID');
		}
		regenerating = false;
	}

	function handleEmojiChange(event: CustomEvent<string[]>) {
		selectedEmojis = event.detail;
	}

	async function openEmojiPicker() {
		if (!showEmojiPicker && child) {
			// Pre-populate with current emoji_id when opening
			const emojiRegex = /\p{Emoji}/gu;
			selectedEmojis = child.emoji_id.match(emojiRegex) || [];
			
			// Fetch all taken emoji IDs
			try {
				const response = await fetch('/api/children');
				if (response.ok) {
					const data = await response.json();
					// Filter out current child's ID
					const childId = child.id;
					takenEmojiIds = data.data
						.filter((c: Child) => c.id !== childId)
						.map((c: Child) => c.emoji_id);
				}
			} catch (err) {
				console.error('Failed to fetch taken emoji IDs:', err);
			}
		}
		showEmojiPicker = !showEmojiPicker;
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
			
			<div class="mt-4 flex justify-center gap-3 flex-wrap">
				<button 
					on:click={regenerateEmojiId}
					disabled={regenerating}
					class="btn btn-secondary text-sm"
				>
					{regenerating ? `🔄 ${$t('reader.journal.generating')}` : `🔄 ${$t('reader.journal.generate_random')}`}
				</button>
				<button
					on:click={openEmojiPicker}
					class="btn btn-primary text-sm"
				>
					{showEmojiPicker ? `❌ ${$t('reader.journal.cancel')}` : `😊 ${$t('reader.journal.choose_emojis')}`}
				</button>
			</div>
			<p class="text-xs text-gray-500 mt-2">
				{$t('reader.journal.emoji_help')}
			</p>

			<!-- Emoji Picker Section -->
			{#if showEmojiPicker}
				<div class="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-purple-300">
					<h3 class="text-lg font-bold text-gray-800 mb-4 text-center">
						{$t('reader.journal.pick_3_emojis')} ✨
					</h3>
					<EmojiPicker 
						bind:selectedEmojis
						requiredCount={3}
						{takenEmojiIds}
						on:change={handleEmojiChange}
					/>
					<div class="flex justify-center gap-3 mt-4">
						<button
							on:click={setCustomEmojiId}
							disabled={selectedEmojis.length !== 3 || regenerating}
							class="btn btn-primary"
						>
							{#if regenerating}
								{$t('common.messages.loading')}...
							{:else}
								✅ {$t('reader.journal.save_emojis')}
							{/if}
						</button>
					</div>
				</div>
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
