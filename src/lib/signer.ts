import { JsonRpcProvider, Wallet, type Signer } from "ethers";

function getTestSigner(provider: JsonRpcProvider): Signer {
    // Define the mnemonic as a string type
    const mnemonic: string = "test test test test test test test test test test test junk";

    // Create a wallet from the mnemonic
    const wallet: Signer = Wallet.fromPhrase(mnemonic, provider);

    console.log("Address:", wallet.getAddress());

    return wallet;
}
