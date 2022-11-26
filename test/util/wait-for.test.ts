import { waitFor } from '../../src/util';
import { describe, it, expect } from 'vitest';

describe('wait for a specified number of seconds', () => {
    it.each([2, 5])(
        'main process should wait for "%n" seconds',
        async (seconds) => {
            expect(await waitFor(seconds)).toBe('done');
        }
    );
});
