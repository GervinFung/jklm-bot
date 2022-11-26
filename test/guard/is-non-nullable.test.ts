import { guardAsStringArray } from '../../src/guard';
import { describe, it, expect } from 'vitest';

describe('guard an unknown value as a string array', () => {
    it.each([{ array: [] }, { array: Array.from({ length: 10 }, () => 'A') }])(
        'should guard "%p" as string array',
        ({ array }) => {
            expect(guardAsStringArray(array)).toStrictEqual(array);
        }
    );
    it.each([[1, '1', true, {}]])(
        'should throw error as "%p" is not string array',
        (randomValue) => {
            expect(() => guardAsStringArray(randomValue)).toThrowError();
        }
    );
});
