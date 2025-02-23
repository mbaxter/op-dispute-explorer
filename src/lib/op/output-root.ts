import { ethers } from "ethers";
import * as bytes from "@lib/bytes";
import * as blocks from "@lib/blocks";

const L2toL1MessagePasserAddress = "0x4200000000000000000000000000000000000016";


const outputRootV0 = bytes.ZERO_BYTES32

export type OutputRootInfo = {
    hash: string;
    version: string;
    stateRoot: string;
    storageRoot: string;
    blockHash: string;
}

async function calculateOutputRoot(provider: ethers.JsonRpcProvider, l2BlockNumber: bigint): Promise<OutputRootInfo> {
    try {
        const version = outputRootV0;
        const blockInfo = await blocks.getBlockInfo(provider, l2BlockNumber);
        const storageRoot = await blocks.getStorageRoot(provider, L2toL1MessagePasserAddress, l2BlockNumber);
    
        // Validate inputs
        bytes.assertValidBytes32(version);
        bytes.assertValidBytes32(blockInfo.stateRoot);
        bytes.assertValidBytes32(storageRoot);
        bytes.assertValidBytes32(blockInfo.hash);
    
        // Concatenate in order: version + stateRoot + storageRoot + blockHash
        const serialized = bytes.concatHex(
            version,
            blockInfo.stateRoot,
            storageRoot,
            blockInfo.hash
        );
    
        const hash =  bytes.hash(serialized);
    
        return {
            hash,
            version,
            stateRoot: blockInfo.stateRoot,
            storageRoot,
            blockHash: blockInfo.hash,
        }
    } catch (error) {
        throw new OutputRootError(error);
    }
}

export class OutputRootError extends Error {
    constructor(error: unknown) {
        super(`Failed to calculate output root: ${error}`);
        this.name = 'OutputRootError';
    }
}

