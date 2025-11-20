<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { generateReaderQRCode } from '$lib/utils/qr';
	import type { Child } from '$lib/types';

	let children: Child[] = [];
	let loading = true;
	let showAddForm = false;
	let formData = {
		name: '',
		grade_or_class: ''
	};
	let qrCodes: Record<string, string> = {};

	onMount(async () => {
		await loadChildren();
	});

	async function loadChildren() {
		loading = true;
		try {
			const response = await fetch('/api/children');
			const data = await response.json();
			children = data.data || [];
		} catch (error) {
			console.error('Error loading children:', error);
		}
		loading = false;
	}

	async function handleSubmit() {
		try {
			const response = await fetch('/api/children', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name || undefined,
					grade_or_class: formData.grade_or_class || undefined
				})
			});

			if (response.ok) {
				showAddForm = false;
				formData = { name: '', grade_or_class: '' };
				await loadChildren();
			} else {
				const error = await response.json();
				alert($t('common.messages.error') + ': ' + error.error);
			}
		} catch (error) {
			alert($t('common.messages.error'));
		}
	}

	async function toggleQR(child: Child) {
		if (qrCodes[child.id]) {
			delete qrCodes[child.id];
			qrCodes = qrCodes;
		} else {
			const baseUrl = window.location.origin;
			const qr = await generateReaderQRCode(baseUrl, child.emoji_id);
			qrCodes[child.id] = qr;
			qrCodes = qrCodes;
		}
	}

	async function deleteChild(id: string) {
		if (!confirm($t('common.messages.confirm_delete'))) return;

		try {
			const response = await fetch(`/api/children/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadChildren();
			} else {
				alert($t('common.messages.error'));
			}
		} catch (error) {
			alert($t('common.messages.error'));
		}
	}
</script>

<svelte:head>
	<title>{$t('admin.children.title')} - {$t('common.app.name')}</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">{$t('admin.children.title')}</h1>
		<button on:click={() => showAddForm = !showAddForm} class="btn btn-primary">
			{showAddForm ? $t('common.actions.cancel') : $t('admin.children.add_child')}
		</button>
	</div>

	<div class="card mb-6 bg-blue-50">
		<h3 class="font-semibold mb-2">{$t('admin.children.emoji_id')}</h3>
		<p class="text-sm text-gray-700">
			{$t('admin.children.emoji_info')}
		</p>
	</div>

	{#if showAddForm}
		<div class="card mb-6">
			<h2 class="text-xl font-semibold mb-4">{$t('admin.children.add_child')}</h2>
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="child-name" class="block text-sm font-medium mb-1">{$t('admin.children.name')}</label>
					<input id="child-name" bind:value={formData.name} class="input" placeholder="{$t('admin.children.name')}" />
				</div>
				<div>
					<label for="child-grade" class="block text-sm font-medium mb-1">{$t('admin.children.grade_or_class')}</label>
					<input id="child-grade" bind:value={formData.grade_or_class} class="input" placeholder="{$t('admin.children.grade_or_class')}" />
				</div>
				<p class="text-sm text-gray-600">{$t('admin.children.generate_emoji')}</p>
				<button type="submit" class="btn btn-primary">{$t('admin.children.add_child')}</button>
			</form>
		</div>
	{/if}

	{#if loading}
		<p class="text-center py-8">{$t('common.messages.loading')}</p>
	{:else if children.length === 0}
		<div class="card text-center py-8 text-gray-500">
			<p>{$t('admin.children.no_children')}</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each children as child (child.id)}
				<div class="card">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-2xl font-bold mb-2">{child.emoji_id}</h3>
							{#if child.name}
								<p class="font-semibold">{child.name}</p>
							{/if}
							{#if child.grade_or_class}
								<p class="text-sm text-gray-600">{child.grade_or_class}</p>
							{/if}
							<p class="text-xs text-gray-500 mt-2">
								{$t('admin.children.reader_page')}: <a href="/reader/{child.emoji_id}" class="text-blue-600 hover:underline" target="_blank">
									/reader/{child.emoji_id}
								</a>
							</p>
						</div>
					<div class="flex space-x-2">
						<button on:click={() => toggleQR(child)} class="btn btn-secondary text-sm">
							{qrCodes[child.id] ? $t('admin.children.hide_qr') : $t('admin.children.qr_code')}
						</button>
						<button on:click={() => deleteChild(child.id)} class="btn btn-danger text-sm">{$t('common.actions.delete')}</button>
					</div>
					</div>
					
					{#if qrCodes[child.id]}
						<div class="mt-4 p-4 bg-white border rounded text-center">
							<img src={qrCodes[child.id]} alt="QR Code" class="mx-auto mb-2" />
							<p class="text-sm text-gray-600">{$t('admin.children.scan_qr')}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
