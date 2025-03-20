<script lang="ts">
	import { NETWORKS } from '@lib/op/config/network';
	import { network } from '@stores/network';
	import { loadGames, clearGames } from '@stores/games';
	import NavLinks from '@components/NavLinks.svelte';
	import Settings from '@components/Settings.svelte';

	const onNetworkChange = () => {
		clearGames();
		loadGames();
	};

	const sortedNetworks = NETWORKS.sort((a, b) => a.name.localeCompare(b.name));
</script>

<nav class="relative flex items-center bg-gray-100 p-4 shadow-md">
	<h1 class="text-2xl font-bold" id="title">Dispute Game Explorer</h1>

	<div class="flex flex-1 items-center justify-center gap-2">
		<NavLinks />
	</div>

	<div class="ml-auto flex items-center gap-4">
		<div class="flex items-center gap-2">
			<label for="network-select">Network:</label>
			<select id="network-select" bind:value={$network} onchange={onNetworkChange}>
				<option value={null} selected disabled>Select a network</option>
				{#each sortedNetworks as net}
					<option value={net}>{net.name}</option>
				{/each}
			</select>
		</div>
		<Settings />
	</div>
</nav>

<style>
	nav {
		position: relative;
		display: flex;
		align-items: center;
		background-color: var(--nav-bg-color, #f3f4f6);
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	h1 {
		font-size: 1.5rem;
		font-weight: bold;
	}

	select {
		padding: 0.25rem 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		background-color: white;
	}

	select:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}
</style>
