<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import type { LoanWithDetails } from '$lib/types';

	let activeLoans: LoanWithDetails[] = [];
	let loading = true;
	let selectedLoanId = '';
	let message = '';
	let messageType: 'success' | 'error' = 'success';

	onMount(async () => {
		await loadActiveLoans();
		loading = false;
	});

	async function loadActiveLoans() {
		try {
			const response = await fetch('/api/loans?filter=active');
			const data = await response.json();
			activeLoans = data.data || [];
		} catch (error) {
			console.error('Error loading loans:', error);
		}
	}

	async function handleReturn() {
		if (!selectedLoanId) {
			message = $t('admin.loans.select_loan');
			messageType = 'error';
			return;
		}

		try {
			const response = await fetch('/api/return', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ loan_id: selectedLoanId })
			});

			if (response.ok) {
				message = $t('common.messages.success_return');
				messageType = 'success';
				selectedLoanId = '';
				await loadActiveLoans();
			} else {
				const error = await response.json();
				message = $t('common.messages.error_prefix') + error.error;
				messageType = 'error';
			}
		} catch (error) {
			message = $t('common.messages.error_return');
			messageType = 'error';
		}
	}
</script>

<svelte:head>
	<title>{$t('common.actions.return')} - {$t('common.app.name')}</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">{$t('admin.loans.return_page_title')}</h1>

	{#if message}
		<div class="mb-6 px-4 py-3 rounded" class:bg-green-100={messageType === 'success'} class:bg-red-100={messageType === 'error'}>
			{message}
		</div>
	{/if}

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if activeLoans.length === 0}
		<div class="card text-center py-8 text-gray-500">
			<p>{$t('admin.loans.no_active_returns')}</p>
		</div>
	{:else}
		<div class="card">
			<form on:submit|preventDefault={handleReturn} class="space-y-4">
				<div>
					<label for="return-loan" class="block text-sm font-medium mb-1">{$t('admin.loans.select_loan')}</label>
					<select id="return-loan" bind:value={selectedLoanId} class="input" required>
						<option value="">{$t('admin.loans.select_loan_placeholder')}</option>
						{#each activeLoans as loan (loan.id)}
							<option value={loan.id}>
								{loan.copy.book.title} - {loan.child?.emoji_id || loan.borrower_name || $t('admin.loans.unknown_borrower')} 
								({$t('admin.loans.checked_out_at')}: {new Date(loan.checked_out_at).toLocaleDateString()})
							</option>
						{/each}
					</select>
				</div>

				<button type="submit" class="btn btn-primary w-full">
					↩️ {$t('admin.loans.return_page_title')}
				</button>
			</form>
		</div>

		<div class="mt-6">
			<h2 class="text-xl font-semibold mb-4">{$t('admin.loans.currently_checked_out')}</h2>
			<div class="space-y-2">
				{#each activeLoans as loan (loan.id)}
					<div class="card">
						<h3 class="font-semibold">{loan.copy.book.title}</h3>
						<p class="text-sm text-gray-600">
							{$t('admin.loans.borrower')}: {loan.child?.emoji_id || loan.borrower_name}
						</p>
						<p class="text-xs text-gray-500">
							{$t('admin.loans.checked_out_at')}: {new Date(loan.checked_out_at).toLocaleDateString()}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
