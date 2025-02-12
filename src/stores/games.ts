import { writable, get, derived } from 'svelte/store';
import { getOpChain } from './network';
import type { OrderedSliceOptions } from '@lib/fetch';
import { DisputeGame } from '@lib/op/contracts/dispute-game';

// Stores
export const games = writable<Map<number, DisputeGame>>(new Map());
export const sortedGames = derived(games, $games => [...$games.values()]);
export const loadingCounter = writable<number>(0);
export const gameCount = writable<bigint>(0n);

const gamesBatchSize = 300;

// Internal state
let _controller: AbortController = new AbortController();
let _lastLoadedIndex: number = -1;

const _loadGames = async (from: number, to: number): Promise<void> => {
  cancelLoadGames(); // Cancel any ongoing requests

  const opChain = get(getOpChain);
  if (!opChain) {
    console.error("No op chain found");
    games.set(new Map()); // Reset games if no contracts
    return;
  }

  console.log("Loading games");

  loadingCounter.update(n => n + 1);

  try {
    const totalGames = await opChain.getGameCount()
    gameCount.set(totalGames);

    const options: OrderedSliceOptions = {
      signal: _controller.signal,
      fromIndex: from,
      toIndex: to,
      batchSize: 100,
      concurrency: 3,
      descending: true
    };

    for await (const batch of opChain.fetchDisputeGames(Number(totalGames), options)) {
      games.update(current => {
        const newMap = new Map(current);
        for (const game of batch) {
          newMap.set(game.index, game);
        }
        return newMap;
      });
    }

    console.log("Games loaded");

    _lastLoadedIndex = from;
  } catch (error) {
    if (!_controller.signal.aborted) {
      console.error("Failed to load games:", error);
      throw error;
    }
  } finally {
    loadingCounter.update(n => n - 1);
  }
};

export const clearGames = (): void => {
  cancelLoadGames();
  games.set(new Map());
  gameCount.set(0n);
};

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
};

// Function to fetch games for a given network
export const loadGames = async (): Promise<void> => {
  return _loadGames(-gamesBatchSize, -1);
};