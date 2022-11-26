import WordsUtil from '../../src/words';
import { describe, it, expect } from 'vitest';

describe('should return a random word', () => {
    const wordsUtil = WordsUtil.create();
    it('should be able to find a random word with a syllable', async () => {
        const wordFound = wordsUtil.getWordFromSyllable({
            syllable: 'hi',
        });
        expect(typeof wordFound).toBe('string');

        const list = wordsUtil.getWords();
        expect(
            wordsUtil.updateWords({
                wordUsed: wordFound,
            })
        ).toStrictEqual(list.filter((word) => word !== wordFound));
    });
});
