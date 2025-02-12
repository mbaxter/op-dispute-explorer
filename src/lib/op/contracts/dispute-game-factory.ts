import { fetchOrderedSlice, type OrderedSliceOptions } from "@lib/fetch";
import type { ContractsFactory, FaultDisputeGameContract } from "./internal/_contracts";
import { DisputeGame } from "./dispute-game";

export class DisputeGameFactory {
    constructor(private readonly contracts: ContractsFactory) {        
    }

    async getGameCount(): Promise<bigint> {
        const dgf = await this._getDGFContract();
        return await dgf.gameCount();
    }

    async *fetchGames(gameCount: number, options: OrderedSliceOptions = {}): AsyncGenerator<DisputeGame[]> {
        for await (const batch of fetchOrderedSlice(
            async () => Number(gameCount),
            this.getGameAtIndex.bind(this), 
            options
        )) {
            yield batch;
        }
    }

    async getGameAtIndex(index: number): Promise<DisputeGame> {
        const dgf = await this._getDGFContract();
        const [gameType, timestamp, gameAddress] = await dgf.gameAtIndex(BigInt(index));
        const contract = await this._getDisputeGame(gameAddress);
        const game = new DisputeGame({ index, gameType, timestamp, gameAddress, contract })
        await game.getRootClaim();
        return game;
    }

    private async _getDGFContract() {
        return await this.contracts.getDisputeGameFactoryContract();
    }

    private async _getDisputeGame(address: string): Promise<FaultDisputeGameContract> {
        return await this.contracts.getFaultDisputeGameContract(address);
    }
}