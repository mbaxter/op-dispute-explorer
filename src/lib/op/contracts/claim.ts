import type { Address } from "@lib/bytes";
import type { TreePosition } from "./position";

export type GameMetadata = {
    maxDepth: number;
    splitDepth: number;
    startingBlockNumber: bigint;
    l2BlockNumber: bigint;
}

export class Claim {
    #index: number;
    #parentIndex: number;    // uint32
    #counteredBy: Address;   // address
    #claimant: Address;      // address
    #bond: bigint;          // uint128
    #claim: string;          // bytes32
    #position: TreePosition;    // uint128
    #clock: Clock;         // uint128
    #gameMetadata: GameMetadata;

    // Cache some calculations
    #blockNumber: bigint;
    #traceIndex: bigint;

    constructor(data: {
        index: number;
        parentIndex: number;
        counteredBy: Address;
        claimant: Address;
        bond: bigint;
        claim: string;
        position: TreePosition;
        clock: Clock;
        gameMetadata: GameMetadata;
    }) {
        this.#index = data.index;
        this.#parentIndex = data.parentIndex;
        this.#counteredBy = data.counteredBy;
        this.#claimant = data.claimant;
        this.#bond = data.bond;
        this.#claim = data.claim;
        this.#position = data.position;
        this.#clock = data.clock;
        this.#gameMetadata = data.gameMetadata;
        this.#blockNumber = this.#calculateBlockNumber();
        this.#traceIndex = this.#calculateTraceIndex();
    }

    get index(): number {
        return this.#index;
    }

    get parentIndex(): number {
        return this.#parentIndex;
    }

    get counteredBy(): Address {
        return this.#counteredBy;
    }

    get claimant(): Address {
        return this.#claimant;
    }

    get bond(): bigint {
        return this.#bond;
    }

    get claim(): string {
        return this.#claim;
    }

    get position(): TreePosition {
        return this.#position;
    }

    get clock(): Clock {
        return this.#clock;
    }

    get splitDepth(): number {
        return this.#gameMetadata.splitDepth;
    }

    get maxDepth(): number {
        return this.#gameMetadata.maxDepth;
    }

    get l2BlockNumber(): bigint {
        return this.#gameMetadata.l2BlockNumber;
    }

    get blockNumber(): bigint {
        return this.#blockNumber;
    }

    get traceIndex(): bigint {
        return this.#traceIndex;
    }

    // The number of the block we are making a claim about
    #calculateBlockNumber(): bigint {
        if (!this.#blockNumber) {
            const positionAtSplitDepth = this.#position.getAncestor(this.splitDepth).getRightmostDescendant(this.splitDepth);
            const blockNumber = this.#gameMetadata.startingBlockNumber + positionAtSplitDepth.index + BigInt(1);
            this.#blockNumber = blockNumber <= this.l2BlockNumber ? blockNumber : this.l2BlockNumber;
        }
        return this.#blockNumber;
    }

    #calculateTraceIndex(): bigint {
        if (!this.#traceIndex) {
            const positionAtTraceDepth = this.#position.getRightmostDescendant(this.maxDepth).getSubtree(this.splitDepth + 1);
            this.#traceIndex = positionAtTraceDepth.index;
        }
        return this.#traceIndex;
    }
    
}

/// ┌────────────┬────────────────┐
/// │    Bits    │     Value      │
/// ├────────────┼────────────────┤
/// │ [0, 64)    │ Duration       │
/// │ [64, 128)  │ Timestamp      │
/// └────────────┴────────────────┘
/// type Clock is uint128;
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

