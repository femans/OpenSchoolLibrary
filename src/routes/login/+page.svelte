<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';

	let email = '';
	let password = '';
	let loading = false;
	let errorMessage = '';

	async function handleLogin() {
		if (!email || !password) {
			errorMessage = 'Please enter email and password';
			return;
		}

		loading = true;
		errorMessage = '';

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		loading = false;

		if (error) {
			errorMessage = error.message;
		} else if (data.user) {
			goto('/admin');
		}
	}

	async function handleSignUp() {
		if (!email || !password) {
			errorMessage = 'Please enter email and password';
			return;
		}

		loading = true;
		errorMessage = '';

		const { error } = await supabase.auth.signUp({
			email,
			password
		});

		loading = false;

		if (error) {
			errorMessage = error.message;
		} else {
			errorMessage = 'Check your email for confirmation link';
		}
	}
</script>

<svelte:head>
	<title>{$t('admin.login.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div class="max-w-md mx-auto mt-16">
	<div class="card">
		<h1 class="text-3xl font-bold text-center mb-6">📚 {$t('common.app.name')}</h1>
		<h2 class="text-xl font-semibold text-center mb-6">{$t('admin.login.title')}</h2>

		{#if errorMessage}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{errorMessage}
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium mb-1">{$t('admin.login.email')}</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="input"
					placeholder="admin@example.com"
					required
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium mb-1">{$t('admin.login.password')}</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="input"
					placeholder="••••••••"
					required
				/>
			</div>

			<div class="flex space-x-3">
				<button type="submit" class="btn btn-primary flex-1" disabled={loading}>
					{loading ? 'Signing in...' : $t('admin.login.sign_in')}
				</button>
				<button
					type="button"
					on:click={handleSignUp}
					class="btn btn-secondary flex-1"
					disabled={loading}
				>
					Sign Up
				</button>
			</div>
		</form>

		<div class="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
			<p class="mb-2"><strong>Note:</strong> Admin accounts must be manually approved.</p>
			<p>After signing up, contact your system administrator to grant admin access.</p>
		</div>
	</div>
</div>
