import { getNextBatch } from "./promise";

export type OrderedSliceOptions = {
    fromIndex?: number;
    toIndex?: number;
    batchSize?: number;
    concurrency?: number;
    descending?: boolean;
    signal?: AbortSignal;
}

type RequiredSliceOptions = Required<Omit<OrderedSliceOptions, 'signal'>> & Pick<OrderedSliceOptions, 'signal'>;

const DEFAULT_SLICE_OPTIONS: RequiredSliceOptions = {
    fromIndex: 0,
    toIndex: -1,
    batchSize: 100,
    concurrency: 5,
    descending: false
};

export async function* fetchOrderedSlice<T>(
    getTotalItems: () => Promise<number>,
    getElement: (index: number) => Promise<T>,
    options: OrderedSliceOptions = {}
): AsyncGenerator<T[]> {
    const totalItems = await getTotalItems();
    if (totalItems === 0) return;

    const opts: RequiredSliceOptions = { ...DEFAULT_SLICE_OPTIONS, ...options };

    let { toIndex, fromIndex } = opts;
    
    // Handle negative indexes relative to totalItems
    if (toIndex < 0) {
        toIndex = totalItems + toIndex;
    }
    if (fromIndex < 0) {
        fromIndex = totalItems + fromIndex;
    }
    
    // Ensure indexes are within bounds
    toIndex = Math.min(Math.max(toIndex, 0), totalItems - 1);
    fromIndex = Math.min(Math.max(fromIndex, 0), totalItems - 1);

    // Handle index order
    if (toIndex < fromIndex) {
        [toIndex, fromIndex] = [fromIndex, toIndex];
    }

    try {
        const chunkSize = opts.batchSize * opts.concurrency;
        const [start, end, step, increment] = opts.descending
            ? [toIndex, fromIndex, -chunkSize, -1]
            : [fromIndex, toIndex, chunkSize, 1];

        const getChunkEnd = opts.descending
            ? (i: number) => Math.max(i + step - increment, end)
            : (i: number) => Math.min(i + step - increment, end);

        const compareIndices = opts.descending
            ? (idx: number, chunkEnd: number) => idx >= chunkEnd
            : (idx: number, chunkEnd: number) => idx <= chunkEnd;

        for (let i = start; opts.descending ? i >= end : i <= end; i += step) {
            if (opts.signal?.aborted) break;
            
            let promises: Array<Promise<T>> = [];
            const chunkEnd = getChunkEnd(i);
            
            // Process all indices in this chunk
            for (let idx = i; compareIndices(idx, chunkEnd); idx += increment) {
                promises.push(getElement(idx));
            }

            // Yield in batches
            while (promises.length > 0) {
                const [batch, remainingPromises] = await getNextBatch(promises);
                promises = remainingPromises;
                
                if (batch.length > 0) {
                    console.log(`Yielding batch of ${batch.length} items`);
                    yield batch;
                }
            }
        }
    } catch (e) {
        if (opts.signal?.aborted) return;
        throw e;
    }
} 