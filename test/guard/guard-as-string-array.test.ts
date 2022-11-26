import { isNonNullable } from '../../src/guard';
import { describe, it, expect } from 'vitest';

describe('type guard a nullable value as non-nullable', () => {
    it.each([0, '', false, 1, '1', [], true, {}])(
        'should guard non-nullable value of "%p" as non-nullable',
        (value) => {
            expect(isNonNullable(value)).toBe(true);
        }
    );
    it.each([[undefined, null]])(
        'should return false for nullable value',
        (value) => {
            expect(isNonNullable(value)).toBe(false);
        }
    );
});
