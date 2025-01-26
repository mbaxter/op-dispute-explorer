import { ethers, type JsonRpcProvider } from "ethers";
import type { Address } from "../eth";

const OptimismPortalAbi = [
    "function respectedGameType() external view returns (uint32)",
] as const;

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