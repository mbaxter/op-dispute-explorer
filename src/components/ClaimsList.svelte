<script lang="ts">
	import type { DisputeGame } from '@lib/game';
	import type { ClaimData } from '@lib/op/claim';
	import { onMount } from 'svelte';
	import { isAddress } from 'ethers';
	import Ether from './Ether.svelte';
	import Address from './Address.svelte';
	import TruncatedValue from './TruncatedValue.svelte';
	export let game: DisputeGame;

	let claims: ClaimData[] = [];
	let loading = true;
	let error: string | null = null;

	async function loadClaims() {
		try {
			loading = true;
			const claimsArray: ClaimData[] = [];
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
					<th>Position</th>
					<th>Parent Index</th>
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
						<td>{claim.position}</td>
						<td>{claim.parentIndex === 4294967295 ? '' : claim.parentIndex}</td>
						<td class="address"><Address address={claim.claimant} maxLength={16} /></td>
						<td><TruncatedValue value={claim.claim} /></td>
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

	.claim {
		font-family: monospace;
		font-size: 0.9em;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
