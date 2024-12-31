import { Wallet, ethers, type Signer } from "ethers";
import { LOCAL } from "@lib/network";
import { getRpcProvider } from "@lib/rpc";

export type Address = string;

function getTestSigner(): Signer {
    // Define the mnemonic as a string type
    const mnemonic: string = "test test test test test test test test test test test junk";

    // Create a wallet from the mnemonic
    const provider = getRpcProvider(LOCAL);
    const wallet: Signer = Wallet.fromPhrase(mnemonic, provider);

    console.log("Address:", wallet.getAddress());

    return wallet;
}
