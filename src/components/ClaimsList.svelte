<script lang="ts">
	import type { DisputeGame } from '@lib/op/contracts/dispute-game';
	import type { Claim } from '@lib/op/contracts/claim';
	import { onMount } from 'svelte';
	import Ether from './Ether.svelte';
	import Address from './Address.svelte';
	import TruncatedValue from './TruncatedValue.svelte';
	import Tooltip from './Tooltip.svelte';
	interface Props {
		game: DisputeGame;
	}

	let { game }: Props = $props();

	let claims: Claim[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	async function loadClaims() {
		try {
			loading = true;
			const claimsArray: Claim[] = [];
			for await (const batch of game.getClaims({ descending: false })) {
				claimsArray.push(...batch);
			}
			claims = claimsArray.sort((a, b) => a.index - b.index);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load claims';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadClaims();
	});
</script>

{#if loading}
	<div class="loading">Loading claims...</div>
{:else if error}
	<div class="error">{error}</div>
{:else if claims.length === 0}
	<div class="empty">No claims found</div>
{:else}
	<div class="claims-list">
		<table>
			<thead>
				<tr>
					<th>Index</th>
					<th>Parent Index</th>
					<th>Depth</th>
					<th>Index</th>
					<th>Block Number</th>
					<th>Trace Index</th>
					<th>Claimant</th>
					<th>Claim</th>
					<th>Bond</th>
					<th>Countered By</th>
				</tr>
			</thead>
			<tbody>
				{#each claims as claim}
					<tr>
						<td>{claim.index}</td>
						<td>{claim.parentIndex === 4294967295 ? '' : claim.parentIndex}</td>
						<td><Tooltip message={`GIndex:${claim.position.gIndex.toString()}`}>{claim.position.depth}</Tooltip></td>
						<td><Tooltip message={`GIndex:${claim.position.gIndex.toString()}`}>{claim.position.index}</Tooltip></td>
						<td>{claim.blockNumber.toString()}</td>
						<td>{claim.traceIndex.toString()}</td>
						<td class="address"><Address address={claim.claimant} maxLength={16} /></td>
						<td><TruncatedValue maxLength={14} value={claim.claim} /></td>
						<td><Ether wei={claim.bond} /></td>
						<td class="address">
							<Address address={claim.counteredBy} maxLength={16} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.claims-list {
		padding: 1rem;
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-color, #ddd);
		text-align: left;
	}

	th {
		font-weight: bold;
		background-color: var(--background-color-secondary, #f5f5f5);
	}

	.address {
		font-family: monospace;
		font-size: 0.9em;
	}

	.loading,
	.error,
	.empty {
		padding: 1rem;
		text-align: center;
	}

	.error {
		color: var(--error-color, #ff3e00);
	}
</style>
