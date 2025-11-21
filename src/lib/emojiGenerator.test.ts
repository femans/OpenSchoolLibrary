import { describe, it, expect, vi } from 'vitest';
import {
	generateEmojiId,
	isValidEmojiId,
	isUniqueEmojiId,
	generateUniqueEmojiId
} from './emojiGenerator';
import * as emojiPool from './emojiPool';

describe('emojiGenerator', () => {
	it('should generate an emoji ID with 3 emojis', () => {
		const emojiId = generateEmojiId();
		const emojis = [...emojiId];
		expect(emojis.length).toBe(3);
	});

	it('should generate different emoji IDs on multiple calls', () => {
		const ids = new Set();
		for (let i = 0; i < 50; i++) {
			ids.add(generateEmojiId());
		}
		// With 200 emojis in pool and 3 positions, collisions are unlikely but possible
		expect(ids.size).toBeGreaterThan(40);
	});

	it('should validate correct emoji ID format', () => {
		const validId = '🐶🌈🎨';
		expect(isValidEmojiId(validId)).toBe(true);
	});

	it('should reject invalid emoji ID formats', () => {
		expect(isValidEmojiId('🐶🌈')).toBe(false); // Only 2 emojis
		expect(isValidEmojiId('🐶🌈🎨🎨')).toBe(false); // 4 emojis
		expect(isValidEmojiId('abc')).toBe(false); // Not emojis
		expect(isValidEmojiId('')).toBe(false); // Empty
	});

	it('should detect unique emoji IDs', () => {
		const existing = ['🐶🌈🎨', '😀🎯🚀'];
		expect(isUniqueEmojiId('🐱🌺✨', existing)).toBe(true);
		expect(isUniqueEmojiId('🐶🌈🎨', existing)).toBe(false);
	});

	it('should generate unique emoji ID avoiding existing ones', () => {
		const existing = ['🐶🌈🎨', '😀🎯🚀'];
		const newId = generateUniqueEmojiId(existing);
		expect(existing).not.toContain(newId);
		expect(isValidEmojiId(newId)).toBe(true);
	});

	it('should throw error if unable to generate unique ID', () => {
		// Mock a very small emoji pool to make collisions guaranteed
		const smallPool: readonly string[] = ['😀', '😍', '😎'];
		vi.spyOn(emojiPool, 'EMOJI_POOL', 'get').mockReturnValue(smallPool);

		// With only 3 emojis, there are only 3^3 = 27 possible combinations
		// Create all possible combinations to force a collision
		const existing = [
			'😀😀😀',
			'😀😀😍',
			'😀😀😎',
			'😀😍😀',
			'😀😍😍',
			'😀😍😎',
			'😀😎😀',
			'😀😎😍',
			'😀😎😎',
			'😍😀😀',
			'😍😀😍',
			'😍😀😎',
			'😍😍😀',
			'😍😍😍',
			'😍😍😎',
			'😍😎😀',
			'😍😎😍',
			'😍😎😎',
			'😎😀😀',
			'😎😀😍',
			'😎😀😎',
			'😎😍😀',
			'😎😍😍',
			'😎😍😎',
			'😎😎😀',
			'😎😎😍',
			'😎😎😎'
		];

		// Now all 27 combinations are taken, so it should throw
		expect(() => generateUniqueEmojiId(existing, 10)).toThrow(
			'Unable to generate unique emoji ID after maximum attempts'
		);

		vi.restoreAllMocks();
	});
});
