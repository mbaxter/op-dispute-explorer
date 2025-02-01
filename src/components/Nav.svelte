<script lang="ts">
	import { NETWORKS } from '@lib/network';
	import { network } from '@stores/network';
	import { loadingCounter, cancelLoadGames, loadGames, clearGames } from '@stores/games';
	import Spinner from '@components/Spinner.svelte';
	import NavLinks from '@components/NavLinks.svelte';

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
		{#if $loadingCounter > 0}
			<Spinner />
			<button onclick={cancelLoadGames}>Cancel</button>
		{/if}
	</div>

	<div class="ml-auto flex items-center gap-2">
		<label for="network-select">Network:</label>
		<select id="network-select" bind:value={$network} onchange={onNetworkChange}>
			<option value={null} selected disabled>Select a network</option>
			{#each sortedNetworks as net}
				<option value={net}>{net.name}</option>
			{/each}
		</select>
	</div>
</nav>
