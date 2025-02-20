import { fetchOrderedSlice, type OrderedSliceOptions } from "@lib/fetch";
import type { Address } from '@lib/eth'
import type { ContractsFactory, FaultDisputeGameContract } from "./internal/_contracts";
import { DisputeGame } from "./dispute-game";

export type GameImplementationEvent = {
  address: Address,
  blockNumber: number,
  timestamp: number 
}

export class DisputeGameFactory {
    #gameImplementations: Map<number, DisputeGame> | null = null;

    constructor(private readonly contracts: ContractsFactory) {}

    async getGameCount(): Promise<bigint> {
        const dgf = await this._getDGFContract();
        return await dgf.gameCount();
    }

    async getAddress(): Promise<Address> {
        const dgf = await this._getDGFContract();
        const address = await dgf.getAddress();
        return address;
    }

    async getGameImplementations(): Promise<Map<number, DisputeGame>> {
        if (!this.#gameImplementations) {
            const dgf = await this._getDGFContract();
            const supportedGameTypes = [0, 1];
            const gameImplementations = new Map<number, DisputeGame>();
            for (const gameType of supportedGameTypes) {
                const gameAddress = await dgf.gameImpls(BigInt(gameType));
                const contract = await this._getDisputeGame(gameAddress);
                const disputeGame = new DisputeGame({ 
                    contractsFactory: this.contracts,
                    index: gameType, 
                    gameType: await contract.gameType(), 
                    timestamp: await contract.createdAt(),
                    gameAddress, 
                    contract 
                });
                gameImplementations.set(gameType, disputeGame);
            }
            this.#gameImplementations = gameImplementations;
        }

        return this.#gameImplementations;
    }

    async getGameImplementationHistory(gameType: number): Promise<GameImplementationEvent[]> {
        const dgf = await this._getDGFContract();
        const events = await dgf.queryFilter(
            dgf.filters.ImplementationSet(undefined, BigInt(gameType)),
            0,
            "latest"
        );
        
        return Promise.all(events.map(async event => ({
            address: event.args.impl as Address,
            blockNumber: event.blockNumber,
            timestamp: (await event.getBlock()).timestamp
        })));
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
        const game = new DisputeGame({ 
            contractsFactory: this.contracts, 
            index, 
            gameType, 
            timestamp, 
            gameAddress, 
            contract 
        })
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