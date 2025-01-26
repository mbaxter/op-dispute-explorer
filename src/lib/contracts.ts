import { ethers, type JsonRpcProvider } from "ethers";
import type { Network } from "./network";
import type { Address } from "./eth";
import { getRpcProvider } from "./rpc";
import { fetchOrderedSlice, type OrderedSliceOptions } from "./fetch";

// Contract ABIs
const SystemConfigAbi = [
    "function disputeGameFactory() external view returns (address addr_)",
    "function optimismPortal() external view returns (address addr_)"
] as const;

const OptimismPortalAbi = [
    "function respectedGameType() external view returns (uint32)",
] as const;

const DisputeGameFactoryAbi = [
    "function gameAtIndex(uint256 _index) external view returns (uint32 gameType_, uint64 timestamp_, address proxy_)",
    "function gameCount() external view returns (uint256 gameCount_)"
] as const;

const DisputeGameAbi = [
    "function claimDataLen() external view returns (uint256 len_)",
    "struct ClaimData { uint32 parentIndex; address counteredBy; address claimant; uint128 bond; bytes32 claim; uint128 position; uint128 clock }",
    "function claimData(uint256) external view returns (ClaimData)"
] as const;

export type DisputeGame = {
    index: number;
    gameType: number;
    timestamp: number;
    proxy: Address;
}

// Type aliases to match Solidity types
export type Claim = string;  // bytes32 comes through as hex string
export type Position = bigint; // uint128
export class Clock {
    readonly duration: number;  // in seconds
    readonly timestamp: Date;
    readonly value: bigint;

    constructor(value: bigint) {
        this.value = value;
        // Extract duration from lower 64 bits (in seconds)
        this.duration = Number(value & BigInt("0xFFFFFFFFFFFFFFFF")); 
        // Extract timestamp from upper 64 bits (in seconds since epoch)
        const timestampSeconds = Number(value >> BigInt(64));
        this.timestamp = new Date(timestampSeconds * 1000); // Convert to milliseconds for Date
    }

    /**
     * Returns true if the clock has expired based on the current time
     */
    isExpired(): boolean {
        return Date.now() >= this.timestamp.getTime() + (this.duration * 1000);
    }

    /**
     * Returns remaining time in seconds, or 0 if expired
     */
    getRemainingSeconds(): number {
        const remaining = (this.timestamp.getTime() + (this.duration * 1000) - Date.now()) / 1000;
        return Math.max(0, remaining);
    }
}

export type ClaimData = {
    parentIndex: number;    // uint32
    counteredBy: Address;   // address
    claimant: Address;      // address
    bond: bigint;          // uint128
    claim: Claim;          // bytes32
    position: Position;    // uint128
    clock: Clock;         // uint128
}

class SystemConfig {
    private readonly contract: ethers.Contract;

    constructor(address: Address, provider: JsonRpcProvider) {
        this.contract = new ethers.Contract(address, SystemConfigAbi, provider);
    }

    async getDisputeGameFactory(): Promise<Address> {
        return await this.contract.disputeGameFactory() as Address;
    }

    async getOptimismPortal(): Promise<Address> {
        return await this.contract.optimismPortal() as Address;
    }
}

export class DisputeGameFactory {
    private readonly contract: ethers.Contract;
    private readonly network: Network;
    private readonly provider: JsonRpcProvider;

    constructor(address: Address, provider: JsonRpcProvider, network: Network) {
        this.contract = new ethers.Contract(address, DisputeGameFactoryAbi, provider);
        this.network = network;
        this.provider = provider;
    }

    async getGameCount(): Promise<number> {
        const count = await this.contract.gameCount();
        return Number(count);
    }

    #getContract(provider: JsonRpcProvider = this.provider): ethers.Contract {
        if (provider && provider !== this.provider) {
            return new ethers.Contract(this.contract.target as Address, DisputeGameFactoryAbi, provider);
        }
        return this.contract;
    }

    async getGameAtIndex(index: number): Promise<DisputeGame> {
        return await this.#getGameAtIndex(index);
    }

    async #getGameAtIndex(index: number, provider: JsonRpcProvider = this.provider): Promise<DisputeGame> {
        const contract = this.#getContract(provider);
        const [gameType, timestamp, proxy] = await contract.gameAtIndex(index);
        return {
            index,
            gameType: Number(gameType),
            timestamp: Number(timestamp),
            proxy: proxy as Address
        };
    }

    async *getDisputeGames(options: OrderedSliceOptions = {}): AsyncGenerator<DisputeGame[]> {
        const getTotalItems = async () => {
            return await this.getGameCount();
        };

        const provider = getRpcProvider(this.network.l1RpcUrl, {batchSize: options.batchSize, batchStallTime: 0})
        const getElement = async (idx: number): Promise<DisputeGame> => {
            return await this.#getGameAtIndex(idx, provider);
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options, descending: true });
    }
}

export class FaultDisputeGame {
    private readonly contract: ethers.Contract;
    private readonly network: Network;
    private readonly provider: JsonRpcProvider;

    constructor(address: Address, provider: JsonRpcProvider, network: Network) {
        this.contract = new ethers.Contract(address, DisputeGameAbi, provider);
        this.network = network;
        this.provider = provider;
    }

    async getClaimCount(): Promise<number> {
        const count = await this.contract.claimDataLen();
        return Number(count);
    }

    async getClaimData(index: number): Promise<ClaimData> {
        return await this.#getClaimAtIndex(index);
    }

    async #getClaimAtIndex(index: number, provider: JsonRpcProvider = this.provider): Promise<ClaimData> {
        const contract = provider === this.provider 
            ? this.contract 
            : new ethers.Contract(this.contract.target as Address, DisputeGameAbi, provider);
            
        const claim = await contract.claimData(index);
        return {
            parentIndex: Number(claim.parentIndex),
            counteredBy: claim.counteredBy as Address,
            claimant: claim.claimant as Address,
            bond: claim.bond,
            claim: claim.claim,
            position: claim.position,
            clock: new Clock(claim.clock)
        };
    }

    async *getClaims(options: OrderedSliceOptions = {}): AsyncGenerator<ClaimData[]> {
        const getTotalItems = async () => {
            return await this.getClaimCount();
        };

        const provider = getRpcProvider(this.network.l1RpcUrl, {
            batchSize: options.batchSize, 
            batchStallTime: 0
        });
        
        const getElement = async (idx: number): Promise<ClaimData> => {
            return await this.#getClaimAtIndex(idx, provider);
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options, descending: true });
    }
}

export class OptimismPortal {
    private readonly contract: ethers.Contract;

    constructor(address: Address, provider: JsonRpcProvider) {
        this.contract = new ethers.Contract(address, OptimismPortalAbi, provider);
    }

    async getRespectedGameType(): Promise<number> {
        const gameType = await this.contract.respectedGameType();
        return Number(gameType);
    }
}

export class OpContracts {
    private readonly provider: JsonRpcProvider;
    private readonly network: Network;
    private readonly systemConfig: SystemConfig;
    private disputeGameFactoryInstance?: DisputeGameFactory;
    private optimismPortalInstance?: OptimismPortal;

    constructor(network: Network) {
        this.network = network;
        this.provider = getRpcProvider(network.l1RpcUrl);
        this.systemConfig = new SystemConfig(network.systemConfigAddress, this.provider);
    }

    async getDisputeGameFactory(): Promise<DisputeGameFactory> {
        if (!this.disputeGameFactoryInstance) {
            const address = await this.systemConfig.getDisputeGameFactory();
            this.disputeGameFactoryInstance = new DisputeGameFactory(
                address,
                this.provider,
                this.network
            );
        }
        return this.disputeGameFactoryInstance;
    }

    async getOptimismPortal(): Promise<OptimismPortal> {
        if (!this.optimismPortalInstance) {
            const address = await this.systemConfig.getOptimismPortal();
            this.optimismPortalInstance = new OptimismPortal(address, this.provider);
        }
        return this.optimismPortalInstance;
    }
}