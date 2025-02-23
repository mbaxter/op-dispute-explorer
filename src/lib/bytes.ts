import { ethers } from "ethers";

export type Hash = string;
export type Address = string;

export const ZERO_ADDRESS= "0x0000000000000000000000000000000000000000"
export const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000"

export function concatHex(...hexStrings: string[]): string {
    // Remove '0x' prefix if present and concatenate
    return '0x' + hexStrings
        .map(hex => hex.startsWith('0x') ? hex.slice(2) : hex)
        .join('');
}

export function validateHexString(hexString: string, byteLength: number): boolean {
    let normalized = hexString;
    if (hexString.startsWith('0x')) {
        normalized = hexString.slice(2);
    }
    return normalized.length === byteLength * 2 && !/[^0-9a-fA-F]/.test(normalized);
}

export function hash(hexString: string): Hash {
    return ethers.keccak256(hexString);
}

export function assertValidAddress(address: string) {
    if (!ethers.isAddress(address)) {
        throw new InvalidAddressError(address);
    }
}

export function assertValidBytes32(hexString: string) {
    if (!validateHexString(hexString, 32)) {
        throw new InvalidBytes32Error(hexString);
    }
}

export class InvalidAddressError extends Error {
    constructor(address: string) {
        super(`Invalid address: ${address}`);
        this.name = 'InvalidAddressError';
    }
}

export class InvalidBytes32Error extends Error {
    constructor(hexString: string) {
        super(`Invalid bytes32: ${hexString}`);
        this.name = 'InvalidBytes32Error';
    }
}