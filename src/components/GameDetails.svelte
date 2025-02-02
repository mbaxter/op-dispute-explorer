<script lang="ts">
	import { games } from '@stores/games';
	import AsyncData from './AsyncData.svelte';
	import type { DisputeGame } from '@lib/game';
	import Address from './Address.svelte';
	export let index: number;

	$: game = $games.get(index);
	$: if (game) {
		// Pre-fetch these async values
		game.getL1Head();
		game.getStatus();
		game.getL2BlockNumberChallenged();
		game.getL2BlockNumberChallenger();
	}
</script>

{#if game}
	<div class="game-details">
		<table>
			<tbody>
				<tr>
					<td>Game Index:</td>
					<td>{game.index}</td>
				</tr>
				<tr>
					<td>Game Type:</td>
					<td>{game.gameType}</td>
				</tr>
				<tr>
					<td>Game Address:</td>
					<td><Address address={game.address} /></td>
				</tr>
				<tr>
					<td>Created At:</td>
					<td>{game.createdAt.toLocaleString()}</td>
				</tr>
				<tr>
					<td>L1 Head:</td>
					<td>
						<AsyncData promise={game.getL1Head()} dataName="L1 head" />
					</td>
				</tr>
				<tr>
					<td>Status:</td>
					<td>
						<AsyncData promise={game.getStatus()} dataName="status" />
					</td>
				</tr>
				<tr>
					<td>L2 Block Number Challenged:</td>
					<td>
						<AsyncData
							promise={game.getL2BlockNumberChallenged()}
							dataName="L2 block number challenged"
						/>
					</td>
				</tr>
				<tr>
					<td>L2 Block Number Challenger:</td>
					<td>
						<AsyncData
							promise={game.getL2BlockNumberChallenger()}
							dataName="L2 block number challenger"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
{:else}
	<p>Game not found</p>
{/if}

<style>
	.game-details {
		padding: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-color, #ddd);
	}

	td:first-child {
		font-weight: bold;
		width: 200px;
	}
</style>
