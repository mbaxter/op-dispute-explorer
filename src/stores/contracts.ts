import { ethers } from 'ethers';
import { derived } from 'svelte/store';
import { network } from './network';
import {
  getDisputeGameFactory,
  getFaultDisputeGame,
  getOptimismPortal,
  getSystemConfig
} from '@lib/contracts';

export const contracts = derived(network, ($network) => {
  if (!$network) return null;

  const provider = new ethers.JsonRpcProvider($network.l1RpcUrl);

  return {
    getDisputeGameFactory: async () => {
      const systemConfig = getSystemConfig(provider, $network.systemConfigAddress);
      const factoryAddress = await systemConfig.disputeGameFactory();
      return getDisputeGameFactory(provider, factoryAddress);
    },
    getFaultDisputeGame: (address: string) => getFaultDisputeGame(provider, address),
    getOptimismPortal: (address: string) => getOptimismPortal(provider, address),
    getSystemConfig: () => getSystemConfig(provider, $network.systemConfigAddress)
  };
}); 