import { ethers } from "ethers";
import type { Network } from "./config/network";
import {ContractsFactory} from '@lib/op/contracts/internal/_contracts';
import { DisputeGame } from "./contracts/dispute-game";
import { fetchOrderedSlice, type OrderedSliceOptions } from "@lib/fetch";
import { DisputeGameFactory } from "./contracts/dispute-game-factory";


export class OPChain {
    private _contracts: ContractsFactory;
    private _disputeGameFactory: DisputeGameFactory | null = null;

    constructor(private readonly network: Network) {
        const provider = new ethers.JsonRpcProvider(network.l1RpcUrl);
        this._contracts = new ContractsFactory(provider, network.systemConfigAddress);
    }

    public async getDisputeGameFactory(): Promise<DisputeGameFactory> {
        if (!this._disputeGameFactory) {
            this._disputeGameFactory = new DisputeGameFactory(this._contracts);
        }
        return this._disputeGameFactory;
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