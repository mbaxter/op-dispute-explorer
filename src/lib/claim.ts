import type { Address } from "./eth";

export type ClaimData = {
    parentIndex: number;    // uint32
    counteredBy: Address;   // address
    claimant: Address;      // address
    bond: bigint;          // uint128
    claim: string;          // bytes32
    position: bigint;    // uint128
    clock: Clock;         // uint128
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