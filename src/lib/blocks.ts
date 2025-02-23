import { ethers } from "ethers";
import * as bytes from "@lib/bytes";

export interface AccountProof {
    accountProof: string[];
    balance: string;
    codeHash: string;
    nonce: string;
    storageHash: string;
    storageProof: Array<{
        key: string;
        proof: string[];
        value: string;
    }>;
}

export async function getProof(
    provider: ethers.JsonRpcProvider, 
    address: string, 
    l2BlockNumber: bigint, 
    storageSlots: string[] = []
): Promise<AccountProof> {
    bytes.assertValidAddress(address);
    const proof = await provider.send("eth_getProof", [
        address, storageSlots, ethers.toQuantity(l2BlockNumber)
    ]);
    
    return proof;
}

export async function getStorageRoot(provider: ethers.JsonRpcProvider, address: string, l2BlockNumber: bigint): Promise<string> {
    const proof = await getProof(provider, address, l2BlockNumber);
    return proof.storageHash;
}

export interface BlockInfo {
    hash: string;
    stateRoot: string;
}

export async function getBlockInfo(provider: ethers.JsonRpcProvider, l2BlockNumber: bigint): Promise<BlockInfo> {
    const block = await provider.getBlock(l2BlockNumber);
    if (!block || !block.hash || !block.stateRoot) {
        throw new BlockNotFoundError(l2BlockNumber);
    }
    return {
        hash: block.hash,
        stateRoot: block.stateRoot
    };
}

export class BlockNotFoundError extends Error {
    constructor(blockNumber: bigint) {
        super(`Block ${blockNumber.toString()} not found or missing required fields`);
        this.name = 'BlockNotFoundError';
    }
}




