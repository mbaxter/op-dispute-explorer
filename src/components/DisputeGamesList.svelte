<script lang="ts">
    import { OpContracts, type DisputeGame } from "@lib/contracts";
	import { NETWORKS, type Network } from "@lib/network";
    import DisputeGamesTable from './DisputeGamesTable.svelte';

    let network: Network | null = $state(null);
    let games:DisputeGame[] = $state([]);
    let controller:AbortController = $state(new AbortController());

    console.log("test");

    const cancel = () => {
        console.log("Cancelling");
        controller.abort();
        controller = new AbortController(); 
    }

    const loadGames = async (): Promise<void> => {
        console.log(`Loading games for network '${network?.name}'`);

        cancel();
        try {
            if (!network) return;
            games = []; // Reset games
            const contracts = new OpContracts(network);
            for await (const batch of contracts.getDisputeGames({signal: controller.signal})) {
                games = [...games, ...batch];
            }
        } catch (e) {
            if (!controller.signal.aborted) throw e;
        }
    };
</script>

<h1>Dispute Games</h1>

<!-- Choose a Network -->
<div>
    <h2>Choose a Network</h2>
    <select bind:value={network} onchange={async (e) => await loadGames()}>
        {#each NETWORKS as network}
            <option value={network}>{network.name}</option>
        {/each}
    </select>
    <button onclick={(e) => cancel()}>Cancel</button>
</div>

{#if network}
    <div>
        <DisputeGamesTable {games} />
    </div>
{/if}
