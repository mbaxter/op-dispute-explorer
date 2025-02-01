# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

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
4. Modify `src/networks.json` with your specific network settings. This file is gitignored and won't be committed to the repository.

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
