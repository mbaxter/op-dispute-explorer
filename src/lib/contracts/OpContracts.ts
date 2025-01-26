import { type JsonRpcProvider } from "ethers";
import type { Network } from "../network";
import { getRpcProvider } from "../rpc";
import { SystemConfig } from "./SystemConfig";
import { DisputeGameFactory } from "./DisputeGameFactory";
import { OptimismPortal } from "./OptimismPortal";

export class OpContracts {
    private readonly provider: JsonRpcProvider;
    private readonly network: Network;
    private readonly systemConfig: SystemConfig;
    private disputeGameFactoryInstance?: DisputeGameFactory;
    private optimismPortalInstance?: OptimismPortal;

    constructor(network: Network) {
        this.network = network;
        this.provider = getRpcProvider(network.l1RpcUrl);
        this.systemConfig = new SystemConfig(network.systemConfigAddress, this.provider);
    }

    async getDisputeGameFactory(): Promise<DisputeGameFactory> {
        if (!this.disputeGameFactoryInstance) {
            const address = await this.systemConfig.getDisputeGameFactory();
            this.disputeGameFactoryInstance = new DisputeGameFactory(
                address,
                this.provider,
                this.network
            );
        }
        return this.disputeGameFactoryInstance;
    }

    async getOptimismPortal(): Promise<OptimismPortal> {
        if (!this.optimismPortalInstance) {
            const address = await this.systemConfig.getOptimismPortal();
            this.optimismPortalInstance = new OptimismPortal(address, this.provider);
        }
        return this.optimismPortalInstance;
    }
} 