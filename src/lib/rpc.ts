import { ethers } from "ethers";

const rpcCache = new Map<string, ethers.JsonRpcProvider>();
export function getRpcProvider(url: string) {
    if (!rpcCache.has(url)) {
        rpcCache.set(url, new ethers.JsonRpcProvider(url));
    }
    return rpcCache.get(url)!;
}