import { isAddress } from 'ethers'
import type { Address } from './eth';

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

const SEPOLIA: L1Config = {
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorer: "https://sepolia.etherscan.io"
}

const ETHEREUM: L1Config = {
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    blockExplorer: "https://etherscan.io"
}

// Export Networks
export const OP_MAINNET = new Network({
    name: "Optimism Mainnet",
    l1: ETHEREUM,
    l2RpcUrl: "https://mainnet.optimism.io/",
    chainId: 10,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290",
});

export const OP_SEPOLIA = new Network({
    name: "Optimism Sepolia",
    l1: SEPOLIA,
    l2RpcUrl: "https://sepolia.optimism.io/",
    chainId: 11155420,
    systemConfigProxy: "0x034edD2A225f7f429A63E0f1D2084B9E0A93b538",
});

export const NETWORKS = [OP_MAINNET, OP_SEPOLIA];
