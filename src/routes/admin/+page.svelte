<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';

	let stats = {
		totalBooks: 0,
		totalCopies: 0,
		activeLoans: 0,
		totalChildren: 0
	};

	onMount(async () => {
		// TODO: Fetch stats from API
		// For now, showing placeholder data
		stats = {
			totalBooks: 0,
			totalCopies: 0,
			activeLoans: 0,
			totalChildren: 0
		};
	});
</script>

<svelte:head>
	<title>{$t('admin.dashboard.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div>
	<h1 class="text-3xl font-bold mb-8">{$t('admin.dashboard.title')}</h1>

	<!-- Stats grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card">
			<h3 class="text-gray-500 text-sm font-medium mb-2">{$t('admin.dashboard.stats.total_books')}</h3>
			<p class="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
		</div>
		<div class="card">
			<h3 class="text-gray-500 text-sm font-medium mb-2">{$t('admin.dashboard.stats.total_copies')}</h3>
			<p class="text-3xl font-bold text-green-600">{stats.totalCopies}</p>
		</div>
		<div class="card">
			<h3 class="text-gray-500 text-sm font-medium mb-2">{$t('admin.dashboard.stats.active_loans')}</h3>
			<p class="text-3xl font-bold text-orange-600">{stats.activeLoans}</p>
		</div>
		<div class="card">
			<h3 class="text-gray-500 text-sm font-medium mb-2">{$t('admin.dashboard.stats.total_children')}</h3>
			<p class="text-3xl font-bold text-purple-600">{stats.totalChildren}</p>
		</div>
	</div>

	<!-- Quick actions -->
	<div class="card">
		<h2 class="text-xl font-semibold mb-4">{$t('admin.dashboard.quick_actions')}</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<a href="/admin/books" class="btn btn-primary text-center">
				📚 {$t('admin.dashboard.manage_books')}
			</a>
			<a href="/admin/catalogue" class="btn btn-primary text-center">
				📖 {$t('admin.dashboard.manage_copies')}
			</a>
			<a href="/admin/children" class="btn btn-primary text-center">
				👦 {$t('admin.dashboard.manage_children')}
			</a>
			<a href="/checkout" class="btn btn-primary text-center">
				✅ {$t('admin.dashboard.checkout_book')}
			</a>
			<a href="/return" class="btn btn-primary text-center">
				↩️ {$t('admin.dashboard.return_book')}
			</a>
			<a href="/admin/loans" class="btn btn-primary text-center">
				📋 {$t('admin.dashboard.view_loans')}
			</a>
		</div>
	</div>
</div>
