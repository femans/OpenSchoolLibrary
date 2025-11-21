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
	<!-- Construction Notice -->
	<div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-4">
				<h2 class="text-xl font-bold text-yellow-800 mb-2">WORK IN PROGRESS - EARLY DEVELOPMENT STAGE</h2>
				<p class="text-yellow-700 font-medium mb-3">
					This software is currently under active construction and represents an early prototype.
				</p>
				<ul class="list-disc list-inside text-yellow-700 space-y-1 text-sm">
					<li><strong>This is NOT a final product</strong> - You are viewing a functional proof-of-concept</li>
					<li><strong>UX/UI design</strong> has not yet been addressed - the interface is purely functional</li>
					<li><strong>Current status:</strong> A database with a basic interface for data interaction</li>
					<li><strong>Many features</strong> are planned but not yet implemented</li>
					<li><strong>Design, workflows, and user experience</strong> will be significantly improved in future iterations</li>
				</ul>
				<p class="text-yellow-700 font-semibold mt-3">
					🚧 This demo demonstrates core functionality only. Full implementation is in progress.
				</p>
			</div>
		</div>
	</div>

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
