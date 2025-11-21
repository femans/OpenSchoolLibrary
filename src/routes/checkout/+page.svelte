<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import type { CopyWithBook, Child } from '$lib/types';

	let copies: CopyWithBook[] = [];
	let children: Child[] = [];
	let loading = true;
	
	let formData = {
		copy_id: '',
		child_id: '',
		borrower_name: '',
		borrower_class: ''
	};

	let message = '';
	let messageType: 'success' | 'error' = 'success';

	onMount(async () => {
		await Promise.all([loadAvailableCopies(), loadChildren()]);
		loading = false;
	});

	async function loadAvailableCopies() {
		try {
			const response = await fetch('/api/copies?status=available');
			const data = await response.json();
			copies = data.data || [];
		} catch (error) {
			console.error('Error loading copies:', error);
		}
	}

	async function loadChildren() {
		try {
			const response = await fetch('/api/children');
			const data = await response.json();
			children = data.data || [];
		} catch (error) {
			console.error('Error loading children:', error);
		}
	}

	async function handleSubmit() {
		if (!formData.copy_id) {
			message = $t('admin.copies.select_book_copy');
			messageType = 'error';
			return;
		}

		if (!formData.child_id && !formData.borrower_name) {
			message = $t('common.messages.select_or_enter');
			messageType = 'error';
			return;
		}

		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				message = $t('common.messages.success_checkout');
				messageType = 'success';
				formData = {
					copy_id: '',
					child_id: '',
					borrower_name: '',
					borrower_class: ''
				};
				await loadAvailableCopies();
			} else {
				const error = await response.json();
				message = $t('common.messages.error_prefix') + error.error;
				messageType = 'error';
			}
		} catch (error) {
			message = $t('common.messages.error_checkout');
			messageType = 'error';
		}
	}
</script>

<svelte:head>
	<title>{$t('common.actions.checkout')} - {$t('common.app.name')}</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">{$t('admin.loans.checkout_page_title')}</h1>

	{#if message}
		<div class="mb-6 px-4 py-3 rounded" class:bg-green-100={messageType === 'success'} class:bg-red-100={messageType === 'error'}>
			{message}
		</div>
	{/if}

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else}
		<div class="card">
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="checkout-copy" class="block text-sm font-medium mb-1">{$t('admin.copies.select_book_copy')}</label>
					<select id="checkout-copy" bind:value={formData.copy_id} class="input" required>
						<option value="">{$t('admin.copies.select_book_placeholder')}</option>
						{#each copies as copy (copy.id)}
							<option value={copy.id}>
								{copy.book.title} {copy.barcode ? `(${copy.barcode})` : ''}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="checkout-child" class="block text-sm font-medium mb-1">{$t('admin.children.select_child')}</label>
					<select id="checkout-child" bind:value={formData.child_id} class="input">
						<option value="">{$t('admin.children.select_child_placeholder')}</option>
						{#each children as child (child.id)}
							<option value={child.id}>
								{child.emoji_id} {child.name ? `- ${child.name}` : ''}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="checkout-borrower-name" class="block text-sm font-medium mb-1">{$t('admin.loans.borrower_name')}</label>
					<input id="checkout-borrower-name" bind:value={formData.borrower_name} class="input" placeholder="{$t('admin.loans.borrower_name_placeholder')}" />
				</div>

				<div>
					<label for="checkout-borrower-class" class="block text-sm font-medium mb-1">{$t('admin.loans.borrower_class')}</label>
					<input id="checkout-borrower-class" bind:value={formData.borrower_class} class="input" placeholder="{$t('admin.loans.borrower_class_placeholder')}" />
				</div>

				<button type="submit" class="btn btn-primary w-full">
					✅ {$t('admin.loans.checkout_page_title')}
				</button>
			</form>
		</div>
	{/if}
</div>
