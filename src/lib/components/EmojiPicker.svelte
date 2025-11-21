<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';

	export let selectedEmojis: string[] = [];
	export let requiredCount: number = 3;
	export let takenEmojiIds: string[] = [];

	const dispatch = createEventDispatcher();

	// Create a reactive set for faster lookups and proper reactivity
	$: selectedSet = new Set(selectedEmojis);
	$: takenSet = new Set(takenEmojiIds);
	$: console.log('Current selection:', selectedEmojis);

	import { EMOJI_POOL } from '$lib/emojiPool';

	// Check if adding this emoji would create a taken combination
	function wouldBeTaken(emoji: string): boolean {
		if (selectedEmojis.includes(emoji)) return false;
		if (selectedEmojis.length !== requiredCount - 1) return false;
		
		const testCombination = [...selectedEmojis, emoji].join('');
		return takenSet.has(testCombination);
	}

	// Use the shared emoji pool
	const emojiList = EMOJI_POOL;

	function toggleEmoji(emoji: string) {
		let newSelection: string[];
		const index = selectedEmojis.indexOf(emoji);
		if (index > -1) {
			// Remove emoji if already selected
			newSelection = selectedEmojis.filter(e => e !== emoji);
		} else {
			// Add emoji if under limit
			if (selectedEmojis.length < requiredCount) {
				newSelection = [...selectedEmojis, emoji];
			} else {
				newSelection = selectedEmojis;
			}
		}
		selectedEmojis = newSelection;
		dispatch('change', newSelection);
	}

	function isSelected(emoji: string): boolean {
		return selectedSet.has(emoji);
	}

	function clearSelection() {
		selectedEmojis = [];
		dispatch('change', selectedEmojis);
	}
</script>

<div class="emoji-picker">
	<div class="mb-3">
		<p class="text-sm font-medium mb-2">
			{$t('reader.picker.select_emojis')}
			<span class="text-gray-500">({selectedEmojis.length}/{requiredCount})</span>
		</p>
		{#if selectedEmojis.length > 0}
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-xs text-gray-500">{$t('reader.picker.selected')}:</span>
				{#each selectedEmojis as emoji, idx (idx)}
					<button
						type="button"
						on:click={() => toggleEmoji(emoji)}
						class="selected-emoji-badge"
						title={$t('reader.picker.click_to_remove')}
					>
						<span class="text-2xl">{emoji}</span>
						<span class="remove-x">×</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="emoji-grid border rounded p-3 bg-gray-50 max-h-64 overflow-y-auto">
		{#each emojiList as emoji (emoji)}
			{@const isDisabled = (!selectedSet.has(emoji) && selectedEmojis.length >= requiredCount) || wouldBeTaken(emoji)}
			{@const isTaken = wouldBeTaken(emoji)}
			<button
				type="button"
				on:click={() => toggleEmoji(emoji)}
				class="emoji-button"
				class:selected={selectedSet.has(emoji)}
				class:disabled={isDisabled}
				class:taken={isTaken}
				disabled={isDisabled}
				title={isTaken ? $t('reader.picker.combination_taken') : ''}
			>
				{emoji}
			</button>
		{/each}
	</div>
</div>

<style>
	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0.25rem;
	}

	.emoji-button {
		padding: 0.5rem;
		font-size: 1.5rem;
		background: white;
		border: 2px solid transparent;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.emoji-button:hover:not(.disabled) {
		background: #e0f2fe;
		border-color: #0ea5e9;
		transform: scale(1.1);
	}

	.emoji-button.selected {
		background: #0ea5e9;
		border-color: #0284c7;
		transform: scale(1.05);
	}

	.emoji-button.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.emoji-button.taken {
		opacity: 0.4;
		background: #fee;
		border-color: #fcc;
	}

	.selected-emoji-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: #0ea5e9;
		border: 2px solid #0284c7;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.selected-emoji-badge:hover {
		background: #0284c7;
		transform: scale(1.05);
	}

	.selected-emoji-badge .remove-x {
		font-size: 1.25rem;
		color: white;
		font-weight: bold;
	}
</style>
