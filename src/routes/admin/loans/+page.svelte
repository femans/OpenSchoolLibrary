<script lang="ts">
	import { onMount } from 'svelte';
	import type { LoanWithDetails } from '$lib/types';
	import { t } from '$lib/i18n';

	let loans: LoanWithDetails[] = [];
	let loading = true;
	let filter: 'all' | 'active' | 'returned' = 'active';

	onMount(async () => {
		await loadLoans();
	});

	async function loadLoans() {
		loading = true;
		try {
			const response = await fetch(`/api/loans?filter=${filter}`);
			const data = await response.json();
			loans = data.data || [];
		} catch (error) {
			console.error('Error loading loans:', error);
		}
		loading = false;
	}

	$: if (filter) {
		loadLoans();
	}
</script>

<svelte:head>
	<title>{$t('admin.loans.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div>
	<h1 class="text-3xl font-bold mb-6">{$t('admin.loans.title')}</h1>

	<div class="card mb-6">
		<div class="flex space-x-4">
			<button 
				on:click={() => filter = 'active'} 
				class="btn" 
				class:btn-primary={filter === 'active'}
				class:btn-secondary={filter !== 'active'}>
				{$t('admin.loans.active_loans')}
			</button>
			<button 
				on:click={() => filter = 'returned'} 
				class="btn" 
				class:btn-primary={filter === 'returned'}
				class:btn-secondary={filter !== 'returned'}>
				{$t('admin.loans.loan_history')}
			</button>
			<button 
				on:click={() => filter = 'all'} 
				class="btn" 
				class:btn-primary={filter === 'all'}
				class:btn-secondary={filter !== 'all'}>
				{$t('admin.loans.all_loans')}
			</button>
		</div>
	</div>

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if loans.length === 0}
		<div class="card text-center py-8 text-gray-500">
			<p>{filter === 'active' ? $t('admin.loans.no_active_loans') : $t('admin.loans.no_loan_history')}</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each loans as loan (loan.id)}
				<div class="card">
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<h3 class="font-semibold text-lg">{loan.copy.book.title}</h3>
							<p class="text-sm text-gray-600">
								Borrower: {loan.child?.emoji_id || loan.borrower_name || 'Unknown'}
								{#if loan.borrower_class}
									({loan.borrower_class})
								{/if}
							</p>
							<p class="text-sm text-gray-500 mt-2">
								{$t('admin.loans.checked_out_at')}: {new Date(loan.checked_out_at).toLocaleDateString()}
							</p>
							{#if loan.returned_at}
								<p class="text-sm text-green-600">
									{$t('admin.loans.returned_at')}: {new Date(loan.returned_at).toLocaleDateString()}
								</p>
							{/if}
						</div>
						{#if !loan.returned_at}
							<span class="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm">
								{$t('common.status.active')}
							</span>
						{:else}
							<span class="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
								{$t('common.status.returned')}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
