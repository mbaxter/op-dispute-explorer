export function nextTick<T>(value: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), 0));
}

/**
 * Get the next batch of contiguous resolved promises
 * @param promises Array of promises to process
 * @returns Tuple of [resolved items, remaining promises]
 */
export async function getNextBatch<T>(promises: Array<Promise<T>>): Promise<[T[], Array<Promise<T>>]> {
    if (promises.length === 0) {
        return [[], []];
    }

    await promises[0];
    
    // Collect all contiguous resolved promises into a batch
    const batch: T[] = [];
    while (promises.length > 0) {        
        try {
            const next = await getIfResolved(promises[0]);   
            if (next === undefined) {
                break;
            }
            
            batch.push(next as T);
            promises.shift();
        } catch (err) {
            // TODO: Handle errors here
            console.error('Error in processPromiseBatch:', err);
            promises.shift();
        }
    }
    
    return [batch, promises];
}

const pendingSignal = 'promise-pending-signal';
export async function getIfResolved<T>(promise: Promise<T>): Promise<T | undefined> {
    const result = await Promise.race([promise, nextTick(pendingSignal)]);
    if (result === pendingSignal) {
        return undefined;
    }
    return result as T;
}