<script lang="ts">
	import type { DisputeGame } from "@lib/contracts";

    export let games: Array<DisputeGame>;
</script>

<table>
    <thead>
        <tr>
            <th>Index</th>
            <th>Game Type</th>
            <th>Timestamp</th>
            <th>Address</th>
        </tr>
    </thead>
    <tbody>
        {#each games as game}
            <tr>
                <td>{game.index}</td>
                <td>{game.gameType}</td>
                <td>{new Date(game.timestamp * 1000).toLocaleString()}</td>
                <td>{game.proxy}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
    th {
        background-color: #f5f5f5;
    }
</style> 