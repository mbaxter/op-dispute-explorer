import { JsonRpcProvider } from 'ethers'
import type { Network } from './config/network'

export class Providers {
    private readonly l1Provider: JsonRpcProvider
    private readonly l2Provider: JsonRpcProvider

    constructor(network: Network) {
        this.l1Provider = new JsonRpcProvider(network.l1RpcUrl)
        this.l2Provider = new JsonRpcProvider(network.l2RpcUrl)
    }

    /**
     * Get the Layer 1 provider
     */
    public get l1(): JsonRpcProvider {
        return this.l1Provider
    }

    /**
     * Get the Layer 2 provider
     */
    public get l2(): JsonRpcProvider {
        return this.l2Provider
    }

    /**
     * Ensure both providers are connected and ready
     * @throws {ProviderInitializationError} If either provider fails to initialize
     */
    public async initialize(): Promise<void> {
        try {
            await Promise.all([
                this.l1Provider.getNetwork(),
                this.l2Provider.getNetwork()
            ])
        } catch (error) {
            throw new ProviderInitializationError(
                'Failed to initialize providers',
                error
            )
        }
    }
}

export class ProviderInitializationError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message)
        this.name = 'ProviderInitializationError'
    }
}
