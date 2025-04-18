# Optimism Dispute Explorer

An experimental WIP client-side application for exploring dispute games on the Optimism Superchain. 

Built with [`sv`](https://github.com/sveltejs/cli).

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up your network configuration:
```bash
cp src/networks.example.json src/networks.json
```
4. You can either modify `src/networks.json` manually with your specific network settings, or use the add-chains script (see below). This file is gitignored and won't be committed to the repository.

### Using the add-chains Script

The repository includes a script to automatically add or update chain configurations from the [Superchain Registry](https://github.com/ethereum-optimism/superchain-registry). To use it:

1. List available chains:
```bash
npm run add-chains
```
This will show all available chains in both mainnet and sepolia environments.

2. Add (or update) one or more chains:
```bash
# Adds/udpates a single chain
npm run add-chains mainnet/base

# Adds/updates multiple chains
npm run add-chains mainnet/base,sepolia/base
```

## Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
