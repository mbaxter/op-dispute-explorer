import type { FaultDisputeGame } from '../types/contracts';
import { Clock, type ClaimData } from './claim';
import type { Address } from './eth';
import { fetchOrderedSlice, type OrderedSliceOptions } from './fetch';

export class DisputeGame {
    readonly #contract: FaultDisputeGame;
    readonly index: number;
    readonly gameType: number;
    readonly address: Address;
    readonly timestamp: number;

    // Cached values
    #l1Head?: string;
    #rootClaim?: string;
    #maxClockDuration?: bigint;
    #l2BlockNumberChallenged?: boolean;
    #l2BlockNumberChallenger?: Address;

    constructor(params: {
        contract: FaultDisputeGame;
        index: number;
        gameType: bigint;
        gameAddress: Address;
        timestamp: bigint;
    }) {
        this.#contract = params.contract;
        this.index = params.index;
        this.gameType = Number(params.gameType);
        this.address = params.gameAddress;
        this.timestamp = Number(params.timestamp);
    }

    // Add utility methods here
    get createdAt(): Date {
        return new Date(this.timestamp * 1000);
    }

    async getL1Head(): Promise<string> {
        if (!this.#l1Head) {
            this.#l1Head = await this.#contract.l1Head();
        }
        return this.#l1Head!;
    }

    async getRootClaim(): Promise<string> {
        if (!this.#rootClaim) {
            this.#rootClaim = await this.#contract.rootClaim();
        }
        return this.#rootClaim!;
    }

    async getStatus(): Promise<number> {
        return Number(await this.#contract.status());
    }

    async getMaxClockDuration(): Promise<bigint> {
        if (!this.#maxClockDuration) {
            this.#maxClockDuration = await this.#contract.maxClockDuration();
        }
        return this.#maxClockDuration!;
    }

    async getL2BlockNumberChallenged(): Promise<boolean> {
        if (this.#l2BlockNumberChallenged === undefined) {
            this.#l2BlockNumberChallenged = await this.#contract.l2BlockNumberChallenged();
        }
        return this.#l2BlockNumberChallenged!;
    }

    async getL2BlockNumberChallenger(): Promise<Address> {
        if (!this.#l2BlockNumberChallenger) {
            this.#l2BlockNumberChallenger = await this.#contract.l2BlockNumberChallenger() as Address;
        }
        return this.#l2BlockNumberChallenger;
    }

    async getClaimCount(): Promise<number> {
        const count = await this.#contract.claimDataLen();
        return Number(count);
    }

    async getClaimData(index: number): Promise<ClaimData> {
        return await this.#getClaimAtIndex(index);
    }

    async #getClaimAtIndex(index: number): Promise<ClaimData> {
        const claim = await this.#contract.claimData(index);
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

        const getElement = async (idx: number): Promise<ClaimData> => {
            return await this.#getClaimAtIndex(idx);
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options, descending: true });
    }

} 