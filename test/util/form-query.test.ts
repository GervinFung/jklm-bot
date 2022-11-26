import { formQuery } from '../../src/util';
import { describe, it, expect } from 'vitest';

describe('form a query from a list of element', () => {
    it.each([
        { array: [] },
        { array: Array.from({ length: 10 }, () => 'div') },
    ])('should form query from "%p"', ({ array }) => {
        expect(formQuery(array)).toStrictEqual(array.join(' > '));
    });
});
