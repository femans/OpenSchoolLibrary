<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	onMount(async () => {
		// Check if user is authenticated
		const { data: { session } } = await supabase.auth.getSession();
		
		if (session) {
			// Redirect to admin dashboard if logged in
			goto('/admin');
		} else {
			// Redirect to login if not logged in
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>OpenSchoolLibrary</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
		<p class="mt-4 text-gray-600">Loading...</p>
	</div>
</div>
