import { ethers, type JsonRpcProvider } from "ethers";
import type { Network } from "../network";
import type { Address } from "../eth";
import { getRpcProvider } from "../rpc";
import { fetchOrderedSlice, type OrderedSliceOptions } from "../fetch";

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