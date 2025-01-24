import { ethers, type JsonRpcProvider } from "ethers";

export type RpcOptions = {
    batchSize?: number;
}

const DEFAULT_OPTIONS: RpcOptions = {
    batchSize: 100,
};

const rpcCache = new Map<string, JsonRpcProvider>();
export function getRpcProvider(url: string, options: RpcOptions = DEFAULT_OPTIONS) {
    const key = `${url}-${JSON.stringify(options)}`;
    const {batchSize} = options;
    if (!rpcCache.has(key)) {
        rpcCache.set(key, new ethers.JsonRpcProvider(url, undefined, {
            batchMaxCount: batchSize,  // max number of requests in a batch
            batchStallTime: 0   // ms to wait for more requests before sending - 0 to disable waiting
        }));
    }
    return rpcCache.get(key)!;
}