import { isAddress } from 'ethers'
import type { Address } from '@lib/bytes';
import defaultNetworksConfig from '../../../networks.json';

interface L1Config {
    rpcUrl: string;
    blockExplorer: string;
}

interface L1RPCs {
    ethereum?: string;
    sepolia?: string;
}

export type L1 = "sepolia" | "ethereum";

export interface NetworkBase {
    name: string;
    l1: L1;
    l2RpcUrl: string;
    chainId: number;
    systemConfigProxy: string;
}

interface NetworksConfig {
    networks: NetworkBase[];
    rpcs: Record<string, L1RPCs>;
}

const BLOCK_EXPLORERS: Record<L1, string> = {
    sepolia: "https://sepolia.etherscan.io",
    ethereum: "https://etherscan.io"
};

export class Network {
    public readonly name: string;
    public readonly chainId: number;
    public readonly systemConfigAddress: Address;
    public readonly l1: L1Config;
    public readonly l2RpcUrl: string;

    get l1RpcUrl(): string {
        return this.l1.rpcUrl;
    }

    get l1BlockExplorer(): string {
        return this.l1.blockExplorer;
    }

    constructor({
        name,
        l1,
        l2RpcUrl,
        chainId,
        systemConfigProxy: systemConfigAddress,
    }: NetworkConfig) {
        if (!isAddress(systemConfigAddress)) {
            throw new Error(`Invalid system config address: ${systemConfigAddress}`)
        }
        this.name = name;
        this.l1 = l1;
        this.l2RpcUrl = l2RpcUrl;
        this.chainId = chainId;
        this.systemConfigAddress = systemConfigAddress;
    }
}

interface NetworkConfig {
    name: string;
    l1: L1Config;
    l2RpcUrl: string;
    chainId: number;
    systemConfigProxy: Address;
}

function findRpcUrl(rpcs: Record<string, L1RPCs>, activeRpcSet: string, chain: L1): string | undefined {
    const rpcSet = rpcs[activeRpcSet];
    if (!rpcSet) {
        return undefined;
    }
    return rpcSet[chain];
}

export function parseNetwork(config: NetworkBase, rpcs: Record<string, L1RPCs>, activeRpcSet: string): Network {
    const { name, l2RpcUrl, chainId, systemConfigProxy, l1 } = config;

    // Validate L1 chain type
    if (!Object.keys(BLOCK_EXPLORERS).includes(l1)) {
        throw new Error(`Invalid L1 chain type "${l1}" in network "${name}". Valid options are: ${Object.keys(BLOCK_EXPLORERS).join(', ')}`);
    }

    const rpcUrl = findRpcUrl(rpcs, activeRpcSet, l1);
    if (!rpcUrl) {
        throw new Error(`No RPC URL found for L1 "${l1}" in RPC set "${activeRpcSet}" for network "${name}"`);
    }

    if (!isAddress(systemConfigProxy)) {
        throw new Error(`Invalid system config address in network "${name}": ${systemConfigProxy}`);
    }

    return new Network({
        name,
        l1: {
            rpcUrl,
            blockExplorer: BLOCK_EXPLORERS[l1]
        },
        l2RpcUrl,
        chainId,
        systemConfigProxy
    });
}

export function getNetworks(config: unknown = defaultNetworksConfig, activeRpcSet: string = 'default'): Network[] {
    if (!config || typeof config !== 'object') {
        throw new Error('Invalid networks configuration');
    }

    const { networks, rpcs } = config as NetworksConfig;

    if (!Array.isArray(networks) || networks.length === 0) {
        throw new Error('No networks found in configuration file');
    }

    if (!rpcs || typeof rpcs !== 'object') {
        throw new Error('Missing or invalid RPC configuration');
    }

    if (!(activeRpcSet in rpcs)) {
        throw new Error(`RPC set "${activeRpcSet}" not found in configuration`);
    }

    return networks.map((networkConfig, index) => {
        try {
            return parseNetwork(networkConfig, rpcs, activeRpcSet);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error parsing network at index ${index}: ${message}`);
        }
    });
}

// Export Networks
export const NETWORKS = getNetworks();