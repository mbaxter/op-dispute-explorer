<script lang="ts">
    import { games, gameCount, loadMoreGames, loadingCounter } from '@stores/games';
	import Button from "./Button.svelte";
</script>

<div class="flex justify-end gap-4 items-center mb-4">
    <h1>Loaded {$games.length} games out of {$gameCount}</h1>
    <Button small={true}
        disabled={$games.length >= $gameCount || $loadingCounter > 0} 
        onclick={() => loadMoreGames()}>Load More</Button>
</div>

<table>
    <thead>
        <tr>
            <th>Index</th>
            <th>Game Type</th>
            <th>Timestamp</th>
            <th>Address</th>
            <th>Details</th>
        </tr>
    </thead>
    <tbody>
        {#each $games as game}
            <tr>
                <td>{game.index}</td>
                <td>{game.gameType}</td>
                <td>{new Date(game.timestamp * 1000).toLocaleString()}</td>
                <td>{game.proxy}</td>
                <td><a href={`/game/${game.index}`}>View</a></td>
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