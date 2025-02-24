import { ethers } from "ethers";
import * as bytes from "@lib/bytes";
import * as blocks from "@lib/blocks";
import { BlockNotFoundError } from "@lib/blocks";

const L2toL1MessagePasserAddress = "0x4200000000000000000000000000000000000016";


const outputRootV0 = bytes.ZERO_BYTES32

export type OutputRootInfo = {
    outputRoot: string;
    version: string;
    stateRoot: string;
    storageRoot: string;
    blockHash: string;
}

export async function calculateOutputRootInfo(provider: ethers.JsonRpcProvider, l2BlockNumber: bigint): Promise<OutputRootInfo> {
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
            outputRoot: hash,
            version,
            stateRoot: blockInfo.stateRoot,
            storageRoot,
            blockHash: blockInfo.hash,
        }
    } catch (error) {
        if (error instanceof BlockNotFoundError) {
            throw new OutputRootError(error.message, { cause: error });
        }
        throw error;
    }
}

export class OutputRootError extends Error {
    constructor(msg: string, options?: ErrorOptions) {
        super(msg, options);
        this.name = 'OutputRootError';
    }
}

