<script lang="ts">
	import { onMount } from 'svelte';
	import type { Book } from '$lib/types';
	import { t } from '$lib/i18n';

	let books: Book[] = [];
	let loading = true;
	let showAddForm = false;
	let formData = {
		title: '',
		authors: '',
		isbn: '',
		cover_url: ''
	};

	onMount(async () => {
		await loadBooks();
	});

	async function loadBooks() {
		loading = true;
		try {
			const response = await fetch('/api/books');
			const data = await response.json();
			books = data.data || [];
		} catch (error) {
			console.error('Error loading books:', error);
		}
		loading = false;
	}

	async function handleSubmit() {
		try {
			const response = await fetch('/api/books', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					authors: formData.authors.split(',').map(a => a.trim()),
					isbn: formData.isbn || undefined,
					cover_url: formData.cover_url || undefined
				})
			});

			if (response.ok) {
				showAddForm = false;
				formData = { title: '', authors: '', isbn: '', cover_url: '' };
				await loadBooks();
			} else {
				const error = await response.json();
				alert('Error: ' + error.error);
			}
		} catch (error) {
			alert('Error adding book');
		}
	}

	async function deleteBook(id: string) {
		if (!confirm($t('common.messages.confirm_delete'))) return;

		try {
			const response = await fetch(`/api/books/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadBooks();
			} else {
				alert('Error deleting book');
			}
		} catch (error) {
			alert('Error deleting book');
		}
	}
</script>

<svelte:head>
	<title>{$t('admin.books.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">{$t('admin.books.title')}</h1>
		<button on:click={() => showAddForm = !showAddForm} class="btn btn-primary">
			{showAddForm ? $t('common.actions.cancel') : `+ ${$t('admin.books.add_book')}`}
		</button>
	</div>

	{#if showAddForm}
		<div class="card mb-6">
			<h2 class="text-xl font-semibold mb-4">{$t('admin.books.add_book')}</h2>
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="book-title" class="block text-sm font-medium mb-1">{$t('admin.books.book_title')} *</label>
					<input id="book-title" bind:value={formData.title} class="input" required />
				</div>
				<div>
					<label for="book-authors" class="block text-sm font-medium mb-1">{$t('admin.books.authors')} * ({$t('admin.books.authors_hint')})</label>
					<input id="book-authors" bind:value={formData.authors} class="input" placeholder="Jane Doe, John Smith" required />
				</div>
				<div>
					<label for="book-isbn" class="block text-sm font-medium mb-1">{$t('admin.books.isbn')}</label>
					<input id="book-isbn" bind:value={formData.isbn} class="input" placeholder="9780140283334" />
				</div>
				<div>
					<label for="book-cover" class="block text-sm font-medium mb-1">{$t('admin.books.cover_url')}</label>
					<input id="book-cover" bind:value={formData.cover_url} class="input" type="url" placeholder="https://..." />
				</div>
				<button type="submit" class="btn btn-primary">{$t('admin.books.add_book')}</button>
			</form>
		</div>
	{/if}

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if books.length === 0}
		<div class="card text-center py-8 text-gray-500">
			<p>{$t('admin.books.no_books')}</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each books as book (book.id)}
				<div class="card">
					{#if book.cover_url}
						<img src={book.cover_url} alt={book.title} class="w-full h-48 object-cover mb-4 rounded" />
					{/if}
					<h3 class="font-semibold text-lg mb-2">{book.title}</h3>
					<p class="text-sm text-gray-600 mb-2">by {book.authors.join(', ')}</p>
					{#if book.isbn}
						<p class="text-xs text-gray-500 mb-4">ISBN: {book.isbn}</p>
					{/if}
					<div class="flex space-x-2">
						<button on:click={() => deleteBook(book.id)} class="btn btn-danger text-sm">{$t('common.actions.delete')}</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
