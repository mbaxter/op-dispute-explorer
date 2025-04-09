import { Clock, type GameMetadata, Claim } from './claim';
import { TreePosition } from "./position";
import type { Address, Hash } from '@lib/bytes';
import { fetchOrderedSlice, type OrderedSliceOptions } from '@lib/fetch';
import { 
    type ContractsFactory, 
    type AnchorStateRegistryContract,
    type MipsContract,
    type FaultDisputeGameContract,
     } from './internal/_contracts';
import type { Providers } from '@lib/op/_providers';
import { calculateOutputRootInfo, type OutputRootInfo } from '@lib/op/output-root';

export class DisputeGame {
    readonly #providers: Providers;
    readonly #contract: FaultDisputeGameContract;
    readonly #contractsFactory: ContractsFactory;
    #anchorStateRegistryContract?: AnchorStateRegistryContract;
    #mipsContract?: MipsContract;
    readonly index: number;
    readonly gameType: number;
    readonly address: Address;
    readonly timestamp: number;

    // Cached values
    #l1Head?: string;
    #rootClaim?: string;
    #maxClockDuration?: bigint;
    #startBlockNumber?: bigint;
    #startingRootHash?: Hash;
    #l2BlockNumber?: bigint;
    #l2BlockNumberChallenged?: boolean;
    #l2BlockNumberChallenger?: Address;
    #maxGameDepth?: number;
    #splitDepth?: number;

    constructor(params: {
        providers: Providers,
        contractsFactory: ContractsFactory,
        contract: FaultDisputeGameContract;
        index: number;
        gameType: bigint;
        gameAddress: Address;
        timestamp: bigint;
    }) {
        this.#providers = params.providers;
        this.#contractsFactory = params.contractsFactory;
        this.#contract = params.contract;
        this.index = params.index;
        this.gameType = Number(params.gameType);
        this.address = params.gameAddress;
        this.timestamp = Number(params.timestamp);
    }

    async #getAnchorStateRegistry(): Promise<AnchorStateRegistryContract> {
        if (!this.#anchorStateRegistryContract) {
            const address = await this.#contract.anchorStateRegistry();
            this.#anchorStateRegistryContract = this.#contractsFactory.getAnchorStateRegistryContract(address);
        }
        return this.#anchorStateRegistryContract;
    }

    async #getMipsContract(): Promise<MipsContract> {
        if (!this.#mipsContract) {
            const address = await this.#contract.vm();
            this.#mipsContract = this.#contractsFactory.getMipsContract(address);
        }
        return this.#mipsContract;
    }

    // Add utility methods here
    get createdAt(): Date {
        return new Date(this.timestamp * 1000);
    }

    async calculateOutputRootInfo(): Promise<OutputRootInfo> {
        const l2BlockNumber = await this.getL2BlockNumber();
        const info = await calculateOutputRootInfo(this.#providers.l2, l2BlockNumber);
        return info;
    }

    async getAnchorStateRegsitryAddress(): Promise<string> {
        const contract = await this.#getAnchorStateRegistry();
        return await contract.getAddress();
    }

    async getMipsAddress(): Promise<string> {
        const contract = await this.#getMipsContract();
        return await contract.getAddress();
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

    async getStartingBlockNumber(): Promise<bigint> {
        if (!this.#startBlockNumber) {
            this.#startBlockNumber = await this.#contract.startingBlockNumber();
        }
        return this.#startBlockNumber!;
    }

    async getStartingRootHash(): Promise<Hash> {
        if (!this.#startingRootHash) {
            this.#startingRootHash = await this.#contract.startingRootHash();
        }
        return this.#startingRootHash!;
    }

    async getL2BlockNumber(): Promise<bigint> {
        if (!this.#l2BlockNumber) {
            this.#l2BlockNumber = await this.#contract.l2BlockNumber();
        }
        return this.#l2BlockNumber!;
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

    async getMaxGameDepth(): Promise<number> {
        if (!this.#maxGameDepth) {
            this.#maxGameDepth = Number(await this.#contract.maxGameDepth());
        }
        return this.#maxGameDepth!;
    }   

    async getSplitDepth(): Promise<number> {
        if (!this.#splitDepth) {
            this.#splitDepth = Number(await this.#contract.splitDepth());
        }
        return this.#splitDepth!;
    }

    async #getGameMetadata(): Promise<GameMetadata> {
        // Load any required data not already cached
        const data = await Promise.all([
            this.getMaxGameDepth(),
            this.getSplitDepth(),
            this.getStartingBlockNumber(),
            this.getL2BlockNumber()
        ]);

        // Return a simple object with the metadata
        return {
            maxDepth: data[0],
            splitDepth: data[1],
            startingBlockNumber: data[2],
            l2BlockNumber: data[3]
        };
    }

    async getClaimCount(): Promise<number> {
        const count = await this.#contract.claimDataLen();
        return Number(count);
    }

    async #getClaimAtIndex(index: number, metadata: GameMetadata): Promise<Claim> {
        const claimData = await this.#contract.claimData(index);
        return new Claim({
            index,
            parentIndex: Number(claimData.parentIndex),
            counteredBy: claimData.counteredBy as Address,
            claimant: claimData.claimant as Address,
            bond: claimData.bond,
            claim: claimData.claim,
            position: TreePosition.fromGIndex(claimData.position),
            clock: new Clock(claimData.clock),
            gameMetadata: metadata
        });
    }

    async *getClaims(options: OrderedSliceOptions = {}): AsyncGenerator<Claim[]> {
        const getTotalItems = async () => {
            return await this.getClaimCount();
        };

        const metadata = await this.#getGameMetadata();

        const getElement = async (idx: number): Promise<Claim> => {
            return await this.#getClaimAtIndex(idx, metadata);
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options });
    }

} 