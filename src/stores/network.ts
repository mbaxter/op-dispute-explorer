import { derived, writable } from 'svelte/store';
import type { Network } from '@lib/op/config/network';
import OPChain from '@lib/op/chain';

// Store for the selected network
export const network = writable<Network | null>(null);

export const getOpChain = derived(network, ($network) => {
  if (!$network) return null;
  return new OPChain($network);
});

