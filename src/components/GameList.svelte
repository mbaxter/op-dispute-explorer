<script lang="ts">
	import { games, gameCount, loadMoreGames, loadingCounter, sortedGames } from '@stores/games';
	import Button from './Button.svelte';
	import AsyncData from './AsyncData.svelte';
	import Spinner from './Spinner.svelte';
	import { cancelLoadGames } from '@stores/games';
	import Address from './Address.svelte';
	import TruncatedValue from './TruncatedValue.svelte';
	import GameType from './GameType.svelte';
	import GameStatus from './GameStatus.svelte';
</script>

<div class="mb-4 flex items-center justify-end gap-4">
	<h1>Loaded {$games.size} games out of {$gameCount}</h1>
	{#if $loadingCounter > 0}
		<Spinner />
		<button onclick={cancelLoadGames}>Cancel</button>
	{/if}
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
			<th>Status</th>
			<th>Claims</th>
			<th>Timestamp</th>
			<th>Address</th>
			<th>Root Claim</th>
			<th>Details</th>
		</tr>
	</thead>
	<tbody>
		{#each $sortedGames as game}
			<tr>
				<td>{game.index}</td>
				<td><GameType value={game.gameType} /></td>
				<td>
					<AsyncData promise={game.getStatus()} dataName="game status">
						{#snippet children({ data })}
							<GameStatus value={data} />
						{/snippet}
					</AsyncData>
				</td>
				<td>
					<AsyncData promise={game.getClaimCount()} dataName="claim count">
						{#snippet children({ data })}
							{data}
						{/snippet}
					</AsyncData>
				</td>
				<td>{game.createdAt.toLocaleDateString([], { month: 'numeric', day: 'numeric' })} {game.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
				<td><Address address={game.address} /></td>
				<td>
					<AsyncData promise={game.getRootClaim()} dataName="root claim">
						{#snippet children({ data })}				
							<TruncatedValue value={data} maxLength={12} />
						{/snippet}
					</AsyncData></td>
				<td class="flex items-center gap-2">
					<a href="/games/{game.index}">View</a>
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
