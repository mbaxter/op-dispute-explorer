<script lang="ts">
    import { NETWORKS } from '@lib/network';
    import { network } from '@stores/network';
    import { loadingCounter, cancelLoadGames, loadGames, clearGames } from '@stores/games';
    import Spinner from '@components/Spinner.svelte';
	import NavLinks from '@components/NavLinks.svelte';

    const onNetworkChange = () => {
        clearGames();
        loadGames();
    }

</script>

<nav class="relative flex items-center p-4 bg-gray-100 shadow-md ">
    <h1 class="text-2xl font-bold" id="title">Dispute Game Explorer</h1>
    
    <div class="flex-1 flex justify-center items-center gap-2">
        <NavLinks />
        {#if $loadingCounter > 0}
            <Spinner />
            <button onclick={cancelLoadGames}>Cancel</button>
        {/if}
    </div>

    <div class="ml-auto flex items-center gap-2">
        <label for="network-select">Choose a Network:</label>
        <select id="network-select" bind:value={$network} onchange={onNetworkChange}>
            <option value="" disabled>Select a network</option>
            {#each NETWORKS as net}
                <option value={net}>{net.name}</option>
            {/each}
        </select>
    </div>
</nav>