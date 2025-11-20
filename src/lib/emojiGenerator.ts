/**
 * Generate a unique 3-emoji identifier for children.
 * This allows anonymous reading tracking without collecting personal info.
 */

// Curated list of recognizable emojis (avoiding similar-looking ones)
const EMOJI_POOL = [
	'😀', '😃', '😄', '😁', '😊', '😍', '🤗', '🤩', '🥳', '😎',
	'🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
	'🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
	'🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
	'🐞', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🐠',
	'🐟', '🐡', '🐬', '🦈', '🐳', '🐋', '🌸', '🌺', '🌻', '🌷',
	'🌹', '🌼', '🌈', '⭐', '✨', '🌟', '💫', '☀️', '🌙', '⚡',
	'🔥', '💧', '🌊', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
	'🍒', '🍑', '🥝', '🥑', '🌽', '🥕', '🍄', '🥜', '🍕', '🍔',
	'🌮', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁', '🍦', '🍨', '🎨',
	'🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎷',
	'🥁', '🎻', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
	'🏓', '🏸', '🥊', '🥋', '⛷️', '🏂', '⛸️', '🚴', '🏆', '🥇',
	'🎯', '🎲', '🎰', '🧩', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️',
	'🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛹',
	'✈️', '🚁', '🚂', '🚆', '🚇', '🚊', '🚝', '🚄', '🚅', '🚈',
	'⛵', '🛶', '🚤', '⛴️', '🚀', '🛸', '🏠', '🏡', '🏰', '🏯',
	'🗼', '🗽', '⛪', '🕌', '🕍', '⛩️', '🏛️', '💎', '📚', '📖',
	'✏️', '✒️', '🖊️', '🖍️', '📝', '💼', '📂', '📅', '📌', '✂️'
];

/**
 * Generate a random 3-emoji ID.
 * @returns A string of 3 emojis, e.g., "🐶🌈🎨"
 */
export function generateEmojiId(): string {
	const emojis: string[] = [];
	for (let i = 0; i < 3; i++) {
		const randomIndex = Math.floor(Math.random() * EMOJI_POOL.length);
		emojis.push(EMOJI_POOL[randomIndex]);
	}
	return emojis.join('');
}

/**
 * Validate an emoji ID format (must be exactly 3 emojis).
 * @param emojiId The emoji string to validate
 * @returns true if valid format
 */
export function isValidEmojiId(emojiId: string): boolean {
	// Split by emoji using spread operator (handles multi-byte unicode)
	const emojis = [...emojiId];
	return emojis.length === 3 && emojis.every(e => EMOJI_POOL.includes(e));
}

/**
 * Check if an emoji ID is unique within an organization.
 * This should be called with database access in actual implementation.
 * @param emojiId The emoji ID to check
 * @param existingIds Array of existing emoji IDs to check against
 * @returns true if unique
 */
export function isUniqueEmojiId(emojiId: string, existingIds: string[]): boolean {
	return !existingIds.includes(emojiId);
}

/**
 * Generate a unique emoji ID, checking against existing IDs.
 * @param existingIds Array of emoji IDs already in use
 * @param maxAttempts Maximum number of generation attempts (default 100)
 * @returns A unique emoji ID
 * @throws Error if unable to generate unique ID after maxAttempts
 */
export function generateUniqueEmojiId(existingIds: string[], maxAttempts = 100): string {
	for (let i = 0; i < maxAttempts; i++) {
		const emojiId = generateEmojiId();
		if (isUniqueEmojiId(emojiId, existingIds)) {
			return emojiId;
		}
	}
	throw new Error('Unable to generate unique emoji ID after maximum attempts');
}
