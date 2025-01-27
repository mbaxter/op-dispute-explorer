<script lang="ts">
	import { games, gameCount, loadMoreGames, loadingCounter, sortedGames } from '@stores/games';
	import Button from './Button.svelte';
	import ExternalLink from './ExternalLink.svelte';
	import { network } from '@stores/network';
	import Spinner from './Spinner.svelte';
	import WarningIcon from './WarningIcon.svelte';
	import Tooltip from './Tooltip.svelte';
	import AsyncData from './AsyncData.svelte';
</script>

<div class="mb-4 flex items-center justify-end gap-4">
	<h1>Loaded {$games.size} games out of {$gameCount}</h1>
	<Button
		small={true}
		disabled={$games.size >= $gameCount || $loadingCounter > 0}
		onclick={() => loadMoreGames()}>Load More</Button
	>
</div>

<table>
	<thead>
		<tr>
			<th>Index</th>
			<th>Game Type</th>
			<th>Timestamp</th>
			<th>Root Claim</th>
			<th>Details</th>
		</tr>
	</thead>
	<tbody>
		{#each $sortedGames as game}
			<tr>
				<td>{game.index}</td>
				<td>{game.gameType}</td>
				<td>{game.createdAt.toLocaleString()}</td>
				<td>
					<AsyncData promise={game.getRootClaim()} dataName="root claim" />
				</td>
				<td class="flex items-center gap-2">
					<a href={`/game/${game.index}`}>View</a>
					<ExternalLink url={`${$network!.l1BlockExplorer}/address/${game.address}`} />
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 8px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}
	th {
		background-color: #f5f5f5;
	}
</style>
