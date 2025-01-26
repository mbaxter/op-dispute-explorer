import { ethers, type JsonRpcProvider } from "ethers";
import type { Network } from "../network";
import type { Address } from "../eth";
import { getRpcProvider } from "../rpc";
import { fetchOrderedSlice, type OrderedSliceOptions } from "../fetch";

const DisputeGameAbi = [
    "function claimDataLen() external view returns (uint256 len_)",
    "function claimData(uint256) external view returns (tuple(uint32 parentIndex, address counteredBy, address claimant, uint128 bond, bytes32 claim, uint128 position, uint128 clock))",
    // Metadata
    "function l1Head() public pure returns (bytes32 l1Head_)",
    "function rootClaim() public pure returns (bytes32 rootClaim_)",
    "function status() external view returns (uint8)",
    "function maxClockDuration() external view returns (uint64 maxClockDuration_)",
    "function l2BlockNumberChallenged() view returns (bool)",
    "function l2BlockNumberChallenger() view returns (address)",
] as const;

export class FaultDisputeGame {
    private readonly contract: ethers.Contract;
    private readonly network: Network;
    private readonly provider: JsonRpcProvider;
    private readonly info: DisputeGameInfo;
    readonly #createdAt: Date;

    // Cached values
    #l1Head?: string;
    #rootClaim?: string;
    #maxClockDuration?: bigint;
    #l2BlockNumberChallenged?: boolean;
    #l2BlockNumberChallenger?: Address;

    constructor(info: DisputeGameInfo, provider: JsonRpcProvider, network: Network) {
        this.contract = new ethers.Contract(info.proxy, DisputeGameAbi, provider);
        this.network = network;
        this.provider = provider;
        this.info = info;
        this.#createdAt = new Date(info.timestamp * 1000);
    }

    get index(): number {
        return this.info.index;
    }

    get gameType(): number {
        return this.info.gameType;
    }

    get createdAt(): Date {
        return this.#createdAt;
    }

    get timestamp(): number {
        return this.info.timestamp;
    }

    get address(): Address {
        return this.info.proxy;
    }

    async getL1Head(): Promise<string> {
        if (!this.#l1Head) {
            this.#l1Head = await this.contract.l1Head();
        }
        return this.#l1Head!;
    }

    async getRootClaim(): Promise<string> {
        if (!this.#rootClaim) {
            this.#rootClaim = await this.contract.rootClaim();
        }
        return this.#rootClaim!;
    }

    async getStatus(): Promise<number> {
        return Number(await this.contract.status());
    }

    async getMaxClockDuration(): Promise<bigint> {
        if (!this.#maxClockDuration) {
            this.#maxClockDuration = await this.contract.maxClockDuration();
        }
        return this.#maxClockDuration!;
    }

    async getL2BlockNumberChallenged(): Promise<boolean> {
        if (this.#l2BlockNumberChallenged === undefined) {
            this.#l2BlockNumberChallenged = await this.contract.l2BlockNumberChallenged();
        }
        return this.#l2BlockNumberChallenged!;
    }

    async getL2BlockNumberChallenger(): Promise<Address> {
        if (!this.#l2BlockNumberChallenger) {
            this.#l2BlockNumberChallenger = await this.contract.l2BlockNumberChallenger() as Address;
        }
        return this.#l2BlockNumberChallenger;
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

export type DisputeGameInfo = {
    index: number;
    gameType: number;
    timestamp: number;
    proxy: Address;
};

