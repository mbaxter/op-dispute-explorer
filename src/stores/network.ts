import { derived, writable } from 'svelte/store';
import type { Network } from '@lib/op/config/network';
import OPChain from '@lib/op/chain';

// Store for the selected network
export const network = writable<Network | null>(null);

let currentNetwork: Network | null = null;
let currentOPChain: OPChain | null = null;

export const opChain = derived(network, ($network) => {
  if ($network === currentNetwork && currentOPChain) {
    // Reuse the cached instance if the network hasn't changed.
    return currentOPChain;
  } else {
    // Create a new instance if the network changes (or on first run).
    currentNetwork = $network;
    currentOPChain = $network ? new OPChain($network) : null;
    return currentOPChain;
  }
});
