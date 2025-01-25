import { ethers, type JsonRpcProvider } from "ethers";
import type {Network} from "./network";
import type { Address } from "./eth";
import { getRpcProvider } from "./rpc";
import { fetchOrderedSlice, type OrderedSliceOptions, type GetProvider } from "./fetch";

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
    private readonly l1Provider: JsonRpcProvider;
    private disputeGameFactoryAddress?: Address;
    private disputeGameFactoryContract?: ethers.Contract;
    private readonly network: Network;
    constructor(network: Network) {
        this.network = network;
        this.l1Provider = getRpcProvider(network.l1RpcUrl);
    }

    #getL1Provider(batchSize: number = 100): JsonRpcProvider {
        return getRpcProvider(this.network.l1RpcUrl, {batchSize});
    }

    #getSystemConfigContract(): ethers.Contract {
        return new ethers.Contract(this.network.systemConfigAddress, SystemConfigAbi, this.l1Provider);
    }

    async #getDisputeGameFactoryContract(batchSize: number = 100): Promise<ethers.Contract> {
        if (!this.disputeGameFactoryContract) {
            const address = await this.getDisputeGameFactory();
            const provider = this.#getL1Provider(batchSize);
            this.disputeGameFactoryContract = new ethers.Contract(address, DisputeGameFactoryAbi, provider);
        }
        return this.disputeGameFactoryContract;
    }

    async getDisputeGameFactory(): Promise<Address> {
        if (!this.disputeGameFactoryAddress) {
            this.disputeGameFactoryAddress = await this.#getSystemConfigContract().disputeGameFactory();
        }
        return this.disputeGameFactoryAddress as Address;
    }

    async getOptimismPortal(): Promise<Address> {
        return await this.#getSystemConfigContract().optimismPortal();
    }

    async getGameCount(): Promise<number> {
        const contract = await this.#getDisputeGameFactoryContract();
        const gameCount = await contract.gameCount();
        return Number(gameCount);
    }

    async *getDisputeGames(options: OrderedSliceOptions = {}): AsyncGenerator<DisputeGame[]> {
        const factoryAddress = await this.getDisputeGameFactory();

        const getTotalItems = async () => {
            return await this.getGameCount();
        };

        const getElement = async (idx: number, getProvider: GetProvider): Promise<DisputeGame> => {
            const provider = getProvider(this.network.l1RpcUrl);
            const contract = new ethers.Contract(factoryAddress, DisputeGameFactoryAbi, provider);
            const [gameType, timestamp, proxy] = await contract.gameAtIndex(idx);
            return {
                index: idx,
                gameType: Number(gameType),
                timestamp: Number(timestamp),
                proxy: proxy as Address
            };
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options, descending: true });
    }
}
