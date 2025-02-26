import fs from 'fs'
import path from 'path'
import { parse } from '@iarna/toml'
import fetch from 'node-fetch'

interface ChainConfig {
    name: string
    l1: string
    l2RpcUrl: string
    chainId: number
    systemConfigProxy: string
}

interface NetworksJson extends Array<ChainConfig> { }

interface SuperchainConfig {
    name: string
    public_rpc: string
    chain_id: number
    addresses: {
        SystemConfigProxy: string
    }
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/superchain/configs'

async function fetchConfig(env: string, chain: string): Promise<SuperchainConfig> {
    const url = `${GITHUB_RAW_URL}/${env}/${chain}.toml`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch config for ${env}/${chain}: ${response.statusText}`)
    }
    const text = await response.text()
    return parse(text) as unknown as SuperchainConfig
}

function getL1Network(env: string): string {
    return env === 'mainnet' ? 'ethereum' : 'sepolia'
}

async function addChain(env: string, chain: string, networks: NetworksJson) {
    const config = await fetchConfig(env, chain)
    const chainConfig: ChainConfig = {
        name: config.name,
        l1: getL1Network(env),
        l2RpcUrl: config.public_rpc,
        chainId: config.chain_id,
        systemConfigProxy: config.addresses.SystemConfigProxy
    }

    // Check if chain already exists
    const existingIndex = networks.findIndex(n => n.chainId === chainConfig.chainId)
    if (existingIndex >= 0) {
        networks[existingIndex] = chainConfig
    } else {
        networks.push(chainConfig)
    }
}

async function listAvailableChains() {
    const envs = ['mainnet', 'sepolia']
    console.log('Available chains:')

    for (const env of envs) {
        const url = `https://api.github.com/repos/ethereum-optimism/superchain-registry/contents/superchain/configs/${env}`
        const response = await fetch(url)
        if (!response.ok) {
            console.error(`Failed to fetch ${env} chains: ${response.statusText}`)
            continue
        }

        const files = await response.json() as Array<{ name: string }>
        const chains = files
            .filter(f => f.name.endsWith('.toml'))
            .map(f => f.name.replace('.toml', ''))

        console.log(`\n${env}:`)
        chains.forEach(chain => console.log(`  ${env}/${chain}`))
    }

    console.log('\nUsage: npm run add-chains env/chain[,env/chain,...]')
}

async function main() {
    const args = process.argv.slice(2)
    if (args.length === 0) {
        await listAvailableChains()
        process.exit(0)
    }

    const networksPath = path.join(process.cwd(), 'src', 'networks.json')
    const networks: NetworksJson = JSON.parse(fs.readFileSync(networksPath, 'utf8'))

    const chains = args[0].split(',')
    for (const chainArg of chains) {
        const [env, chain] = chainArg.split('/')
        if (!env || !chain || !['mainnet', 'sepolia'].includes(env)) {
            console.error(`Invalid chain format: ${chainArg}. Expected format: env/chain where env is mainnet or sepolia`)
            process.exit(1)
        }

        try {
            await addChain(env, chain, networks)
            console.log(`Added/updated ${env}/${chain}`)
        } catch (error) {
            console.error(`Failed to add ${env}/${chain}:`, error)
            process.exit(1)
        }
    }

    fs.writeFileSync(networksPath, JSON.stringify(networks, null, 2) + '\n')
    console.log('Successfully updated networks.json')
}

main().catch(console.error) 