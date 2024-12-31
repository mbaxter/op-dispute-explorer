import { ethers, type JsonRpcProvider } from "ethers";

const rpcCache = new Map<string, JsonRpcProvider>();
export function getRpcProvider(url: string) {
    if (!rpcCache.has(url)) {
        rpcCache.set(url, new ethers.JsonRpcProvider(url, undefined, {
            batchMaxCount: 100,  // max number of requests in a batch
            batchStallTime: 10   // ms to wait for more requests before sending
        }));
    }
    return rpcCache.get(url)!;
}