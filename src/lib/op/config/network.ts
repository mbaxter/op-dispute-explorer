import { isAddress } from 'ethers'
import type { Address } from '@lib/bytes';
import defaultNetworksConfig from '../../../networks.json';

interface L1Config {
    rpcUrl: string;
    blockExplorer: string;
}

interface NetworkConfig {
    name: string;
    l1: L1Config;
    l2RpcUrl: string;
    chainId: number;
    systemConfigProxy: Address;
}

const L1_CONFIGS: Record<string, L1Config> = {
    sepolia: {
        rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
        blockExplorer: "https://sepolia.etherscan.io"
    },
    ethereum: {
        rpcUrl: "https://ethereum-rpc.publicnode.com",
        blockExplorer: "https://etherscan.io"
    }
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

export function parseNetwork(config: unknown): Network {
    // Validate required fields
    if (!config || typeof config !== 'object') {
        throw new Error('Invalid network configuration');
    }

    const { name, l2RpcUrl, chainId, systemConfigProxy, l1 } = config as Record<string, unknown>;

    if (!name || typeof name !== 'string') {
        throw new Error('Missing or invalid "name"');
    }
    if (!l2RpcUrl || typeof l2RpcUrl !== 'string') {
        throw new Error(`Missing or invalid "l2RpcUrl" in network "${name}"`);
    }
    if (typeof chainId !== 'number') {
        throw new Error(`Missing or invalid "chainId" in network "${name}"`);
    }
    if (!systemConfigProxy || typeof systemConfigProxy !== 'string') {
        throw new Error(`Missing or invalid "systemConfigProxy" in network "${name}"`);
    }
    if (!isAddress(systemConfigProxy)) {
        throw new Error(`Invalid system config address in network "${name}": ${systemConfigProxy}`);
    }

    // Parse L1 configuration
    let parsedL1: L1Config;
    if (typeof l1 === 'string') {
        const normalizedL1 = l1.trim().toLowerCase();
        if (!(normalizedL1 in L1_CONFIGS)) {
            throw new Error(`Invalid L1 reference "${l1}" in network "${name}". Valid options are: ${Object.keys(L1_CONFIGS).join(', ')}`);
        }
        parsedL1 = L1_CONFIGS[normalizedL1];
    } else if (l1 && typeof l1 === 'object') {
        const l1Config = l1 as Record<string, unknown>;
        if (!l1Config.rpcUrl || typeof l1Config.rpcUrl !== 'string') {
            throw new Error(`Missing or invalid "l1.rpcUrl" in network "${name}"`);
        }
        if (!l1Config.blockExplorer || typeof l1Config.blockExplorer !== 'string') {
            throw new Error(`Missing or invalid "l1.blockExplorer" in network "${name}"`);
        }
        parsedL1 = {
            rpcUrl: l1Config.rpcUrl,
            blockExplorer: l1Config.blockExplorer
        };
    } else {
        throw new Error(`Missing or invalid "l1" configuration in network "${name}"`);
    }

    return new Network({
        name,
        l1: parsedL1,
        l2RpcUrl,
        chainId,
        systemConfigProxy
    });
}

export function getNetworks(config: unknown = defaultNetworksConfig): Network[] {
    if (!Array.isArray(config) || config.length === 0) {
        throw new Error('No networks found in configuration file');
    }

    return config.map((networkConfig, index) => {
        try {
            return parseNetwork(networkConfig);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error parsing network at index ${index}: ${message}`);
        }
    });
}

// Export Networks
export const NETWORKS = getNetworks();