import { ethers, type JsonRpcProvider } from "ethers";
import type { Network } from "./network";
import type { Address } from "./eth";
import { getRpcProvider } from "./rpc";
import { fetchOrderedSlice, type OrderedSliceOptions, type GetProvider } from "./fetch";

// Contract ABIs
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

class SystemConfig {
    private readonly contract: ethers.Contract;

    constructor(address: Address, provider: JsonRpcProvider) {
        this.contract = new ethers.Contract(address, SystemConfigAbi, provider);
    }

    async getDisputeGameFactory(): Promise<Address> {
        return await this.contract.disputeGameFactory() as Address;
    }

    async getOptimismPortal(): Promise<Address> {
        return await this.contract.optimismPortal() as Address;
    }
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

    async getGameAtIndex(index: number): Promise<DisputeGame> {
        const [gameType, timestamp, proxy] = await this.contract.gameAtIndex(index);
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

        const getElement = async (idx: number, getProvider: GetProvider): Promise<DisputeGame> => {
            const provider = getProvider(this.network.l1RpcUrl);
            const tempFactory = new DisputeGameFactory(
                this.contract.target as Address,
                provider,
                this.network
            );
            return await tempFactory.getGameAtIndex(idx);
        };

        yield* fetchOrderedSlice(getTotalItems, getElement, { ...options, descending: true });
    }
}

export class OptimismPortal {
    private readonly contract: ethers.Contract;

    constructor(address: Address, provider: JsonRpcProvider) {
        this.contract = new ethers.Contract(address, OptimismPortalAbi, provider);
    }

    async getRespectedGameType(): Promise<number> {
        const gameType = await this.contract.respectedGameType();
        return Number(gameType);
    }
}

export class OpContracts {
    private readonly l1Provider: JsonRpcProvider;
    private readonly network: Network;
    private readonly systemConfig: SystemConfig;
    private disputeGameFactoryInstance?: DisputeGameFactory;
    private optimismPortalInstance?: OptimismPortal;

    constructor(network: Network) {
        this.network = network;
        this.l1Provider = getRpcProvider(network.l1RpcUrl);
        this.systemConfig = new SystemConfig(network.systemConfigAddress, this.l1Provider);
    }

    #getL1Provider(batchSize: number = 100): JsonRpcProvider {
        return getRpcProvider(this.network.l1RpcUrl, { batchSize });
    }

    async getDisputeGameFactory(): Promise<DisputeGameFactory> {
        if (!this.disputeGameFactoryInstance) {
            const address = await this.systemConfig.getDisputeGameFactory();
            this.disputeGameFactoryInstance = new DisputeGameFactory(
                address,
                this.#getL1Provider(100),
                this.network
            );
        }
        return this.disputeGameFactoryInstance;
    }

    async getOptimismPortal(): Promise<OptimismPortal> {
        if (!this.optimismPortalInstance) {
            const address = await this.systemConfig.getOptimismPortal();
            this.optimismPortalInstance = new OptimismPortal(address, this.l1Provider);
        }
        return this.optimismPortalInstance;
    }
}
