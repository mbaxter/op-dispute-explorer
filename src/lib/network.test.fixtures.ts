export const validNetworkWithStringL1 = {
    name: "Test Network",
    l1: "ethereum",
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
};

export const validNetworkWithCustomL1 = {
    name: "Custom L1",
    l1: {
        rpcUrl: "https://custom.rpc",
        blockExplorer: "https://custom.explorer"
    },
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
};

export const networkWithNormalizedL1 = {
    name: "Test Network",
    l1: " ETHEREUM ",
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
};

export const networkWithInvalidL1Reference = {
    name: "Test Network",
    l1: "invalid",
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
};

export const networkWithMissingL2RpcUrl = {
    name: "Test Network",
    l1: "ethereum",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
};

export const networkWithInvalidAddress = {
    name: "Test Network",
    l1: "ethereum",
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "not-an-address"
};

export const networkWithInvalidL1Config = {
    name: "Test Network",
    l1: {
        rpcUrl: "https://custom.rpc"
        // missing blockExplorer
    },
    l2RpcUrl: "https://test.network",
    chainId: 1234,
    systemConfigProxy: "0x229047fed2591dbec1eF1118d64F7aF3dB9EB290"
}; 