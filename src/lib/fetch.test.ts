import { describe, it, expect } from 'vitest';
import { fetchOrderedSlice, type OrderedSliceOptions } from './fetch';

describe('fetchOrderedSlice', () => {
    // Helper function to generate test data
    const generateItems = (count: number) => 
        Array.from({ length: count }, (_, i) => ({ idx: i, value: `item${i}` }));
    
    const items = generateItems(10); // Test data set
    
    // Mock fetch function that returns items based on index
    const mockGetElement = async (index: number) => items[index];
    const mockGetTotalItems = async () => items.length;

    interface TestCase {
        name: string;
        options: OrderedSliceOptions;
        expectedIndices: number[];
    }

    const testCases: TestCase[] = [
        {
            name: 'default options',
            options: {},
            expectedIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
            name: 'desc, batch size 3, default concurrency',
            options: {
                descending: true,
                batchSize: 3,
                fromIndex: 0,
                toIndex: 5
            },
            expectedIndices: [5, 4, 3, 2, 1, 0],
        },
        {
            name: 'desc, batch size 3, concurrency 1',
            options: {
                descending: true,
                batchSize: 3,
                fromIndex: 0,
                toIndex: 5
            },
            expectedIndices: [5, 4, 3, 2, 1, 0],
        },
        {
            name: 'desc, batch size 3, concurrency 5',
            options: {
                descending: true,
                batchSize: 3,
                fromIndex: 0,
                toIndex: 5
            },
            expectedIndices: [5, 4, 3, 2, 1, 0],
        },
        {
            name: 'asc, custom range',
            options: {
                fromIndex: 2,
                toIndex: 7,
                batchSize: 2
            },
            expectedIndices: [2, 3, 4, 5, 6, 7],
        },
        {
            name: 'asc, custom range, concurrency 1',
            options: {
                fromIndex: 2,
                toIndex: 7,
                batchSize: 2,
                concurrency: 1
            },
            expectedIndices: [2, 3, 4, 5, 6, 7],
        },
        {
            name: 'asc, custom range, concurrency 5',
            options: {
                fromIndex: 2,
                toIndex: 7,
                batchSize: 2,
                concurrency: 5
            },
            expectedIndices: [2, 3, 4, 5, 6, 7],
        },
        {
            name: 'negative indices',
            options: {
                fromIndex: -5,
                toIndex: -2,
                batchSize: 2
            },
            expectedIndices: [5, 6, 7, 8],
        }
    ];

    it.each(testCases)('$name', async ({ options, expectedIndices }) => {
        const results: any[] = [];
        
        for await (const batch of fetchOrderedSlice(
            mockGetTotalItems,
            mockGetElement,
            options
        )) {
            results.push(...batch);
        }

        // Check indices
        expect(results.map(item => item.idx)).toEqual(expectedIndices);
        expect(results).toHaveLength(expectedIndices.length);

        // Check if items match expected values
        results.forEach((item, i) => {
            expect(item.value).toBe(`item${item.idx}`);
        });
    });

    it('should handle empty input', async () => {
        const results: any[] = [];
        for await (const batch of fetchOrderedSlice(async () => 0, mockGetElement)) {
            results.push(...batch);
        }
        expect(results).toHaveLength(0);
    });

    it('should respect batch size', async () => {
        const batchSize = 3;
        for await (const batch of fetchOrderedSlice(mockGetTotalItems, mockGetElement, { batchSize })) {
            expect(batch.length).toBeLessThanOrEqual(batchSize);
        }
    });

    it('should handle AbortSignal', async () => {
        const controller = new AbortController();
        const results: any[] = [];
        
        // Abort after first batch
        setTimeout(() => controller.abort(), 0);

        try {
            for await (const batch of fetchOrderedSlice(mockGetTotalItems, mockGetElement, { 
                signal: controller.signal,
                batchSize: 2
            })) {
                results.push(...batch);
            }
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(results.length).toBeLessThanOrEqual(2);
        }
    });
}); 