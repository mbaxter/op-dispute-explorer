import { writable } from 'svelte/store';
import type { Network } from '@lib/network';

// Store for the selected network
export const network = writable<Network | null>(null);
