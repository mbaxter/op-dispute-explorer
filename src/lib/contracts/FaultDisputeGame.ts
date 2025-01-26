import { ethers, type JsonRpcProvider } from "ethers";
import type { Network } from "../network";
import type { Address } from "../eth";
import { getRpcProvider } from "../rpc";
import { fetchOrderedSlice, type OrderedSliceOptions } from "../fetch";

const DisputeGameAbi = [
    "function claimDataLen() external view returns (uint256 len_)",
    "struct ClaimData { uint32 parentIndex; address counteredBy; address claimant; uint128 bond; bytes32 claim; uint128 position; uint128 clock }",
    "function claimData(uint256) external view returns (ClaimData)"
] as const;

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