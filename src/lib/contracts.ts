import { ethers, type JsonRpcProvider } from "ethers";
import type {Network} from "./network";
import type { Address } from "./eth";
import { getRpcProvider } from "./rpc";

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

export type DisputeGame = {
    index: number;
    gameType: number;
    timestamp: number;
    proxy: Address;
}

export type DisputeGamesOptions = {
    // Indexes are inclusive and can be negative to index from the end of the games
    fromIndex?: number;
    toIndex?: number;
    batchSize?: number;
    concurrency?: number;
    signal?: AbortSignal;
}

type RequiredDisputeGamesOptions = Required<Omit<DisputeGamesOptions, 'signal'>> & Pick<DisputeGamesOptions, 'signal'>;
const DEFAULT_OPTIONS: RequiredDisputeGamesOptions = {
    fromIndex: 0,
    toIndex: -1,
    batchSize: 100,
    concurrency: 5
};

export class OpContracts {
    private readonly l1Provider: JsonRpcProvider;
    private disputeGameFactoryAddress?: Address;
    private disputeGameFactoryContract?: ethers.Contract;

    constructor(
        private readonly network: Network
    ) {
        this.l1Provider = getRpcProvider(network.l1RpcUrl);
    }

    async getDisputeGameFactory(): Promise<Address> {
        if (!this.disputeGameFactoryAddress) {
            const systemConfig = new ethers.Contract(this.network.systemConfigAddress, SystemConfigAbi, this.l1Provider);
            this.disputeGameFactoryAddress = await systemConfig.disputeGameFactory();
        }
        return this.disputeGameFactoryAddress as Address;
    }

    private async getDisputeGameFactoryContract(): Promise<ethers.Contract> {
        if (!this.disputeGameFactoryContract) {
            const address = await this.getDisputeGameFactory();
            this.disputeGameFactoryContract = new ethers.Contract(address, DisputeGameFactoryAbi, this.l1Provider);
        }
        return this.disputeGameFactoryContract;
    }

    async getOptimismPortal(): Promise<Address> {
        const systemConfig = new ethers.Contract(this.network.systemConfigAddress, SystemConfigAbi, this.l1Provider);
        const optimismPortal = await systemConfig.optimismPortal();
        return optimismPortal;
    }

    async getGameCount(): Promise<number> {
        const contract = await this.getDisputeGameFactoryContract();
        const gameCount = await contract.gameCount();
        return Number(gameCount);
    }

    async *getDisputeGames(options: DisputeGamesOptions = {}): AsyncGenerator<DisputeGame[]> {
        const opts: RequiredDisputeGamesOptions = { ...DEFAULT_OPTIONS, ...options };
        
        try {
            const disputeGameFactoryContract = await this.getDisputeGameFactoryContract();
            let toIndex = opts.toIndex;
            let fromIndex = opts.fromIndex;
            const gameCount = await this.getGameCount();
            // Define negative indexes relative to gameCount
            if (toIndex < 0) {
                toIndex = gameCount + toIndex;
            }
            if (fromIndex < 0) {
                fromIndex = gameCount + fromIndex;
            }
            if (toIndex < fromIndex) {
                // Reverse
                [toIndex, fromIndex] = [fromIndex, toIndex];
            }
            
            for (let i = toIndex; i >= fromIndex; i -= opts.batchSize) {
                if (opts.signal?.aborted) break;
                
                const promises: Array<Promise<DisputeGame>> = [];
                const start = Math.max(i - opts.batchSize + 1, 0);
                
                for (let idx = i; idx >= start; idx--) {
                    promises.push((async () => {
                        const [gameType, timestamp, proxy] = await disputeGameFactoryContract.gameAtIndex(idx);
                        return {
                            index: idx,
                            gameType: Number(gameType),
                            timestamp: Number(timestamp),
                            proxy: proxy as Address
                        }
                    })());
                }
                
                yield await Promise.all(promises);
            }
        } catch (e) {
            if (opts.signal?.aborted) return;
            throw e;
        }
    }


}
