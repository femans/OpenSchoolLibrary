<script lang="ts">
	import '../app.css';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	let user: any = null;

	onMount(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			user = session?.user ?? null;
		});

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user ?? null;
			
			if (event === 'SIGNED_IN') {
				// Redirect to dashboard after login
				if ($page.url.pathname === '/login') {
					goto('/admin');
				}
			}
			
			if (event === 'SIGNED_OUT') {
				goto('/login');
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	async function handleLogout() {
		await supabase.auth.signOut();
	}

	// Check if current path requires auth
	$: isAuthRequired = $page.url.pathname.startsWith('/admin') || 
	                     $page.url.pathname.startsWith('/checkout') || 
	                     $page.url.pathname.startsWith('/return');
	$: isLoginPage = $page.url.pathname === '/login';
</script>

<div class="min-h-screen flex flex-col">
	{#if user && !isLoginPage}
		<!-- Navigation bar for authenticated users -->
		<nav class="bg-blue-600 text-white shadow-lg">
			<div class="container mx-auto px-4 py-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-6">
						<a href="/admin" class="hover:opacity-80">
							<img src="/OSL froggy.png" alt="OpenSchoolLibrary" class="h-12 md:h-24" />
						</a>
						<a href="/admin/books" class="hover:text-blue-200">{$t('common.nav.books')}</a>
						<a href="/admin/copies" class="hover:text-blue-200">{$t('common.nav.copies')}</a>
						<a href="/admin/children" class="hover:text-blue-200">{$t('common.nav.children')}</a>
						<a href="/admin/loans" class="hover:text-blue-200">{$t('common.nav.loans')}</a>
						<a href="/checkout" class="hover:text-blue-200">{$t('common.actions.checkout')}</a>
						<a href="/return" class="hover:text-blue-200">{$t('common.actions.return')}</a>
					</div>
					<div class="flex items-center space-x-4">
						<LanguageSelector />
						<span class="text-sm">{user.email}</span>
						<button on:click={handleLogout} class="btn btn-secondary text-sm">
							{$t('common.nav.logout')}
						</button>
					</div>
				</div>
			</div>
		</nav>
	{/if}

	<!-- Main content -->
	<main class="flex-1 container mx-auto px-4 py-8">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-gray-200 text-gray-600 text-center py-4 text-sm">
		<p>{$t('common.app.name')} MVP - {$t('common.app.tagline')}</p>
	</footer>
</div>
