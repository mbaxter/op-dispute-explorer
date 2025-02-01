import { isAddress } from 'ethers'
import type { Address } from './eth';

interface NetworkConfig {
    name: string;
    l1RpcUrl: string;
    l2RpcUrl: string;
    chainId: number;
    systemConfigProxy: Address;
    l1BlockExplorer: string;
}

export class Network {
    public readonly name: string;
    public readonly l1RpcUrl: string;
    public readonly l2RpcUrl: string;
    public readonly chainId: number;
    public readonly systemConfigAddress: Address;
    public readonly l1BlockExplorer: string;

    constructor({
        name,
        l1RpcUrl,
        l2RpcUrl,
        chainId,
        systemConfigProxy: systemConfigAddress,
        l1BlockExplorer
    }: NetworkConfig) {
        if (!isAddress(systemConfigAddress)) {
            throw new Error(`Invalid system config address: ${systemConfigAddress}`)
        }
        this.name = name;
        this.l1RpcUrl = l1RpcUrl;
        this.l2RpcUrl = l2RpcUrl;
        this.chainId = chainId;
        this.systemConfigAddress = systemConfigAddress;
        this.l1BlockExplorer = l1BlockExplorer;
    }
}

const SEPOLIA = "https://ethereum-sepolia-rpc.publicnode.com"
const ETHEREUM = "https://ethereum-rpc.publicnode.com"

// Export Networks
export const OP_MAINNET = new Network({
    name: "Optimism Mainnet",
    l1RpcUrl: ETHEREUM,
    l2RpcUrl: "https://mainnet.optimism.io/",
    chainId: 10,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290",
    l1BlockExplorer: "https://etherscan.io"
});

export const OP_SEPOLIA = new Network({
    name: "Optimism Sepolia",
    l1RpcUrl: SEPOLIA,
    l2RpcUrl: "https://sepolia.optimism.io/",
    chainId: 11155420,
    systemConfigProxy: "0x034edD2A225f7f429A63E0f1D2084B9E0A93b538",
    l1BlockExplorer: "https://sepolia.etherscan.io"
});

export const NETWORKS = [OP_MAINNET, OP_SEPOLIA];
