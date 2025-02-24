import type { Network } from "./config/network";
import {ContractsFactory} from '@lib/op/contracts/internal/_contracts';
import { DisputeGame } from "./contracts/dispute-game";
import { type OrderedSliceOptions } from "@lib/fetch";
import { DisputeGameFactory } from "./contracts/dispute-game-factory";
import type { Address } from "@lib/bytes";
import type { PortalContract } from "./contracts/internal/_contracts";
import { Providers } from "./_providers";


export class OPChain {
    #providers: Providers;
    #contracts: ContractsFactory;
    #disputeGameFactory: DisputeGameFactory | null = null;
    #portalContract: PortalContract | null = null;

    constructor(network: Network) {
        this.#providers = new Providers(network);
        this.#contracts = new ContractsFactory(this.#providers, network.systemConfigAddress);
    }

    public async initialize(): Promise<void> {
        try {
            await this.#providers.initialize();
        } catch (error) {
            console.warn("Failed to initialize providers", error);
        }
    }

    public async getPortalContractAddress(): Promise<Address> {
        const portal = await this.#getPortalContract();
        return await portal.getAddress();
    }

    public async isPaused(): Promise<boolean> {
        const portal = await this.#getPortalContract();
        return await portal.paused();
    }

    public async getRespectedGameType(): Promise<number> {
        const portal = await this.#getPortalContract();
        return Number(await portal.respectedGameType());
    }

    async #getPortalContract(): Promise<PortalContract> {
        if (!this.#portalContract) {
            this.#portalContract = await this.#contracts.getPortalContract();
        }
        return this.#portalContract;
    }

    public async getDisputeGameFactory(): Promise<DisputeGameFactory> {
        if (!this.#disputeGameFactory) {
            this.#disputeGameFactory = new DisputeGameFactory(this.#providers, this.#contracts);
        }
        return this.#disputeGameFactory;
    }

    async getGameCount(): Promise<bigint> {
        const dgf = await this.getDisputeGameFactory();
        return await dgf.getGameCount();
    }

    async *fetchDisputeGames(gameCount: number, options: OrderedSliceOptions = {}): AsyncGenerator<DisputeGame[]> {
        const dgf = await this.getDisputeGameFactory();
        for await (const batch of dgf.fetchGames(gameCount, options)) {
            yield batch;
        }
    }
}

export default OPChain;