import { ethers } from "ethers";
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

export class OpContracts {
    private readonly l1Provider: ethers.JsonRpcProvider;

    constructor(
        private readonly network: Network
    ) {
        this.l1Provider = getRpcProvider(network.l1RpcUrl);
    }

    async getDisputeGameFactory(): Promise<Address> {
        const systemConfig = new ethers.Contract(this.network.systemConfigAddress, SystemConfigAbi, this.l1Provider);
        const disputeGameFactory = await systemConfig.disputeGameFactory();
        return disputeGameFactory;
    }

    async getOptimismPortal(): Promise<Address> {
        const systemConfig = new ethers.Contract(this.network.systemConfigAddress, SystemConfigAbi, this.l1Provider);
        const optimismPortal = await systemConfig.optimismPortal();
        return optimismPortal;
    }

    async *getDisputeGames(batchSize: number, signal?: AbortSignal): AsyncGenerator<DisputeGame[]> {
        try {
            const disputeGameFactory = await this.getDisputeGameFactory();
            const disputeGameFactoryContract = new ethers.Contract(disputeGameFactory, DisputeGameFactoryAbi, this.l1Provider);
            const gameCount = await disputeGameFactoryContract.gameCount();
            
            for (let i = Number(gameCount) - 1; i >= 0; i -= batchSize) {
                if (signal?.aborted) break;
                const promises: Array<() => Promise<DisputeGame>> = [];
                const start = Math.max(i - batchSize + 1, 0);
                for (let idx = i; idx >= start; idx--) {
                    promises.push(async () => {
                        const [gameType, timestamp, proxy] = await disputeGameFactoryContract.gameAtIndex(idx);
                        return {
                            index: idx,
                            gameType: Number(gameType), // uint32
                            timestamp: Number(timestamp), // uint64
                            proxy: proxy as Address // address
                        }
                    });
                }
                
                // Execute batch
                yield await Promise.all(promises.map(fn => fn()));
            }
        } catch (e) {
            if (signal?.aborted) return;
            throw e;
        }
    }


}
