import { describe, expect, it } from 'vitest';
import { getNextBatch, nextTick } from './promise';
import { vi } from 'vitest';

describe('getNextBatch', () => {
    const promiseA = Promise.resolve('a');
    const promiseB = Promise.resolve('b');
    const promiseC = Promise.resolve('c');
    const pending = new Promise(resolve => {});

    it('returns empty arrays for empty input', async () => {
        const [resolved, remaining] = await getNextBatch([]);
        expect(resolved).toEqual([]);
        expect(remaining).toEqual([]);
    });

    it('returns single resolved promise', async () => {
        const [resolved, remaining] = await getNextBatch([promiseA]);
        expect(resolved).toEqual(['a']);
        expect(remaining).toEqual([]);
    });

    it('returns multiple resolved promises in order', async () => {
        const [resolved, remaining] = await getNextBatch([promiseA, promiseB, promiseC]);
        expect(resolved).toEqual(['a', 'b', 'c']);
        expect(remaining).toEqual([]);
    });

    it('handles mix of resolved and pending promises', async () => {
        const [resolved, remaining] = await getNextBatch([promiseA, pending, promiseC]);
        expect(resolved).toEqual(['a']);
        expect(remaining).toEqual([pending, promiseC]);
    });

    // TODO: Handle rejected promises
    it('drops rejected promises', async () => {
        const rejected = Promise.reject(new Error('test error'));
        const [resolved, remaining] = await getNextBatch([promiseA, rejected, promiseB, pending, promiseC]);
        expect(resolved).toEqual(['a', 'b']);
        expect(remaining).toEqual([pending, promiseC]);
        await rejected.catch(() => {/* Expected rejection */}); // Handle the rejection after the test
    });

    it('should wait on first promise', async () => {
        vi.useFakeTimers();
        const pending = new Promise(resolve => setTimeout(() => resolve('delayed'), 1000));
        const promiseA = Promise.resolve('a');
        
        const batchPromise = getNextBatch([pending, promiseA]);
        let isResolved = false;
        batchPromise.then(() => isResolved = true);
        expect(isResolved).toBe(false);
        
        // Fast-forward timers
        await vi.runAllTimersAsync();
        
        const [resolved, remaining] = await batchPromise;
        expect(resolved).toEqual(['delayed', 'a']);
        expect(remaining).toEqual([]);
        
        vi.useRealTimers();
    });
}); 