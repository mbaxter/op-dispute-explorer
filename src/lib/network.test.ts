import { describe, it, expect, vi } from 'vitest'
import { Network, getNetworks, parseNetwork } from './network'
import * as fixtures from './network.test.fixtures'

describe('Network Configuration', () => {
    describe('parseNetwork', () => {
        it('should validate and create network with string L1 reference', () => {
            const network = parseNetwork(fixtures.validNetworkWithStringL1)
            expect(network).toBeInstanceOf(Network)
            expect(network.name).toBe("Test Network")
            expect(network.l1RpcUrl).toBe("https://ethereum-rpc.publicnode.com")
            expect(network.chainId).toBe(1234)
        })

        it('should validate and create network with custom L1 config', () => {
            const network = parseNetwork(fixtures.validNetworkWithCustomL1)
            expect(network.l1RpcUrl).toBe("https://custom.rpc")
            expect(network.l1BlockExplorer).toBe("https://custom.explorer")
        })

        it('should normalize L1 string references', () => {
            const network = parseNetwork(fixtures.networkWithNormalizedL1)
            expect(network.l1RpcUrl).toBe("https://ethereum-rpc.publicnode.com")
        })

        it('should throw on invalid L1 string reference', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidL1Reference))
                .toThrow('Invalid L1 reference "invalid"')
        })

        it('should throw on missing required fields', () => {
            expect(() => parseNetwork(fixtures.networkWithMissingL2RpcUrl))
                .toThrow('Missing or invalid "l2RpcUrl"')
        })

        it('should throw on invalid system config address', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidAddress))
                .toThrow('Invalid system config address')
        })

        it('should throw on invalid L1 config structure', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidL1Config))
                .toThrow('Missing or invalid "l1.blockExplorer"')
        })

        it('should throw on non-object config', () => {
            expect(() => parseNetwork("not an object"))
                .toThrow('Invalid network configuration')
        })
    })

    describe('getNetworks', () => {
        it('should throw error when networks array is empty', () => {
            expect(() => getNetworks([])).toThrow('No networks found in configuration file')
        })

        it('should validate multiple networks', () => {
            const networks = getNetworks([
                fixtures.validNetworkWithStringL1,
                fixtures.validNetworkWithCustomL1
            ])
            expect(networks).toHaveLength(2)
            expect(networks[0].name).toBe("Test Network")
            expect(networks[1].name).toBe("Custom L1")
        })

        it('should include index in error message', () => {
            expect(() => getNetworks([
                fixtures.validNetworkWithStringL1,
                "not an object"
            ])).toThrow('Error parsing network at index 1: Invalid network configuration')
        })
    })
}) 