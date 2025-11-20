import { describe, it, expect } from 'vitest';
import {
	generateEmojiId,
	isValidEmojiId,
	isUniqueEmojiId,
	generateUniqueEmojiId
} from './emojiGenerator';

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
		// Create a scenario where it's impossible to find a unique ID
		const allPossibleIds = Array(10000).fill(0).map(() => generateEmojiId());
		expect(() => generateUniqueEmojiId(allPossibleIds, 5)).toThrow();
	});
});
