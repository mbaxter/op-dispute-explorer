import { writable, get } from 'svelte/store';
import { OpContracts, type DisputeGame } from '@lib/contracts';
import { network } from '@stores/network';
import type { OrderedSliceOptions } from '@lib/fetch';

// Stores
export const games = writable<DisputeGame[]>([]);
export const loadingCounter = writable<number>(0);
export const gameCount = writable<number>(0);

const gamesBatchSize = 300;
// Internal state
let _controller: AbortController = new AbortController();
let _lastLoadedIndex: number = -1;

const _loadGames = async (from: number, to: number): Promise<void> => {
    cancelLoadGames(); // Cancel any ongoing requests

    const selectedNetwork = get(network);
    if (!selectedNetwork) {
        games.set([]); // Reset games if no network
        return;
    }

    loadingCounter.update(n => n + 1);

    try {
        const contracts = new OpContracts(selectedNetwork);
        const dgf = await contracts.getDisputeGameFactory();
        const totalGames = await dgf.getGameCount();
        gameCount.set(totalGames);
        const options: OrderedSliceOptions = {
            signal: _controller.signal,
            toIndex: to,
            fromIndex: from,
            batchSize: 100,
            concurrency: 3,
            descending: true
        }
        for await (const batch of dgf.getDisputeGames(options)) {
            games.update(current => [...current, ...batch]);
        }
        _lastLoadedIndex = from;
    } catch (error) {
        if (!_controller.signal.aborted) {
            // TODO: Better error handling
            console.error("Failed to load games:", error);
            throw error;
        }
    } finally {
        loadingCounter.update(n => n - 1);
    }
};

export const clearGames = (): void => {
    cancelLoadGames();
    games.set([]);
    gameCount.set(0);
}

// Function to cancel ongoing requests
export const cancelLoadGames = (): void => {
    if (_controller) {
        const oldController = _controller;
        _controller = new AbortController();
        oldController.abort();
        console.log('Game loading canceled.');
    }
};

export const loadMoreGames = async (): Promise<void> => {
    const to = _lastLoadedIndex - 1;
    const from = to - gamesBatchSize + 1;
    return _loadGames(from, to);
}

// Function to fetch games for a given network
export const loadGames = async (): Promise<void> => {
    return _loadGames(-gamesBatchSize, -1);
};
