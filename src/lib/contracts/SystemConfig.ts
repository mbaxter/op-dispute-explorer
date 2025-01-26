import { ethers, type JsonRpcProvider } from "ethers";
import type { Address } from "../eth";

const SystemConfigAbi = [
    "function disputeGameFactory() external view returns (address addr_)",
    "function optimismPortal() external view returns (address addr_)"
] as const;

export class SystemConfig {
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