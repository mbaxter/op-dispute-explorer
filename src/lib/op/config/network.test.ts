import { describe, it, expect, vi } from 'vitest'
import { Network, getNetworks, parseNetwork } from './network'
import * as fixtures from './network.test.fixtures'

const TEST_RPCS = [{
    ethereum: "https://ethereum-rpc.publicnode.com",
    sepolia: "https://ethereum-sepolia-rpc.publicnode.com"
}];

describe('Network Configuration', () => {
    describe('parseNetwork', () => {
        it('should validate and create network with string L1 reference', () => {
            const network = parseNetwork(fixtures.validNetworkWithStringL1, TEST_RPCS)
            expect(network).toBeInstanceOf(Network)
            expect(network.name).toBe("Test Network")
            expect(network.l1RpcUrl).toBe("https://ethereum-rpc.publicnode.com")
            expect(network.chainId).toBe(1234)
        })

        it('should validate and create network with custom L1 config', () => {
            const network = parseNetwork(fixtures.validNetworkWithCustomL1, TEST_RPCS)
            expect(network.l1RpcUrl).toBe("https://custom.rpc")
            expect(network.l1BlockExplorer).toBe("https://custom.explorer")
        })

        it('should normalize L1 string references', () => {
            const network = parseNetwork(fixtures.networkWithNormalizedL1, TEST_RPCS)
            expect(network.l1RpcUrl).toBe("https://ethereum-rpc.publicnode.com")
        })

        it('should throw on invalid L1 string reference', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidL1Reference, TEST_RPCS))
                .toThrow('Invalid L1 reference "invalid"')
        })

        it('should throw on missing required fields', () => {
            expect(() => parseNetwork(fixtures.networkWithMissingL2RpcUrl, TEST_RPCS))
                .toThrow('Missing or invalid "l2RpcUrl"')
        })

        it('should throw on invalid system config address', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidAddress, TEST_RPCS))
                .toThrow('Invalid system config address')
        })

        it('should throw on invalid L1 config structure', () => {
            expect(() => parseNetwork(fixtures.networkWithInvalidL1Config, TEST_RPCS))
                .toThrow('Missing or invalid "l1.blockExplorer"')
        })

        it('should throw on non-object config', () => {
            expect(() => parseNetwork("not an object", TEST_RPCS))
                .toThrow('Invalid network configuration')
        })
    })

    describe('getNetworks', () => {
        it('should throw error when networks array is empty', () => {
            expect(() => getNetworks({ networks: [], rpcs: TEST_RPCS }))
                .toThrow('No networks found in configuration file')
        })

        it('should validate multiple networks', () => {
            const networks = getNetworks({
                networks: [
                    fixtures.validNetworkWithStringL1,
                    fixtures.validNetworkWithCustomL1
                ],
                rpcs: TEST_RPCS
            })
            expect(networks).toHaveLength(2)
            expect(networks[0].name).toBe("Test Network")
            expect(networks[1].name).toBe("Custom L1")
        })

        it('should include index in error message', () => {
            expect(() => getNetworks({
                networks: [
                    fixtures.validNetworkWithStringL1,
                    "not an object"
                ],
                rpcs: TEST_RPCS
            })).toThrow('Error parsing network at index 1: Invalid network configuration')
        })

        it('should throw error when rpcs is missing', () => {
            expect(() => getNetworks({
                networks: [fixtures.validNetworkWithStringL1]
            })).toThrow('Missing or invalid RPC configuration')
        })

        it('should throw error when rpcs is empty array', () => {
            expect(() => getNetworks({
                networks: [fixtures.validNetworkWithStringL1],
                rpcs: []
            })).toThrow('Missing or invalid RPC configuration')
        })
    })
}) 