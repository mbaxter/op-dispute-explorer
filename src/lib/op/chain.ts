import { ethers } from "ethers";
import type { Network } from "./config/network";
import {
  getDisputeGameFactory,
  getFaultDisputeGame,
  getOptimismPortal,
  getSystemConfig
} from '@lib/op/contracts';
import { DisputeGame } from "./game";
import { fetchOrderedSlice, type OrderedSliceOptions } from "@lib/fetch";
import { gameCount, games } from "@stores/games";


export class OPChain {
    private provider: ethers.JsonRpcProvider;
    private _systemConfig: any | null = null;
    private _disputeGameFactory: any | null = null;

    constructor(private readonly network: Network) {
        this.provider = new ethers.JsonRpcProvider(network.l1RpcUrl);
    }

    async getGameCount() {
        const dgf = await this.getDisputeGameFactory();
        return await dgf.gameCount();
    }

    async *fetchGames(gameCount: number, options: OrderedSliceOptions = {}): AsyncGenerator<DisputeGame[]> {
      const batches =  fetchOrderedSlice(
          async () => Number(gameCount),
          this.getGameAtIndex.bind(this),
          options
      );
      for await (const batch of batches) {
            yield batch;
        }
    }


    async getGameAtIndex(index: number) {
        const dgf = await this.getDisputeGameFactory();
        const [gameType, timestamp, gameAddress] = await dgf.gameAtIndex(BigInt(index));
        const contract = await this.getFaultDisputeGame(gameAddress);
        const game = new DisputeGame({ index, gameType, timestamp, gameAddress, contract })
        await game.getRootClaim();
        return game;
    }

    private async getSystemConfig() {
        if (!this._systemConfig) {
            this._systemConfig = getSystemConfig(this.provider, this.network.systemConfigAddress);
        }
        return this._systemConfig;
    }

    private async getDisputeGameFactory() {
        if (!this._disputeGameFactory) {
            const systemConfig = await this.getSystemConfig();
            const factoryAddress = await systemConfig.disputeGameFactory();
            this._disputeGameFactory = getDisputeGameFactory(this.provider, factoryAddress);
        }
        return this._disputeGameFactory;
    }

    async getFaultDisputeGame(address: string) {
        return getFaultDisputeGame(this.provider, address);
    }

    async getOptimismPortal(address: string) {
        return getOptimismPortal(this.provider, address);
    }
}

export default OPChain;