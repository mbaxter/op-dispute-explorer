<script lang="ts">
	import { run } from 'svelte/legacy';

	import { games } from '@stores/games';
	import AsyncData from './AsyncData.svelte';
	import Address from './Address.svelte';
	import { OutputRootError } from '@lib/op/output-root';
	import ValidationIcon from './ValidationIcon.svelte';
	import Button from './Button.svelte';
	import { BlockNotFoundError } from '@lib/blocks';
	import L1Block from './L1Block.svelte';
	import GameType from './GameType.svelte';
	import GameStatus from './GameStatus.svelte';
	interface Props {
		index: number;
	}

	let { index }: Props = $props();

	let game = $derived($games.get(index));
	run(() => {
		if (game) {
			// Pre-fetch these async values
			game.getL1Head();
			game.getStatus();
			game.getL2BlockNumberChallenged();
			game.getL2BlockNumberChallenger();
		}
	});

	let isValidating = $state(false);
	let isValid: boolean | null = $state(null);
	let validationError: string | null = $state(null);

	async function validateRootClaim() {
		if (!game) return;
		
		isValidating = true;
		isValid = null;
		
		try {
			const outputRootInfo = await game.calculateOutputRootInfo();
			const rootClaim = await game.getRootClaim();
			console.log('Calculated output root info:', outputRootInfo);
			isValid = outputRootInfo.outputRoot === rootClaim
			if (!isValid) {
				validationError = `Root claim does not match calculated output root: ${outputRootInfo.outputRoot}`;
			}
		} catch (error) {
			if (error instanceof OutputRootError) {
				isValid = false;
				validationError = error.message;
			} else {
				console.error('Failed to calculate output root:', error);	
			}
		} finally {
			isValidating = false;
		}
	}
</script>

<div class="container">
	<a href="/games" class="back-link text-primary">← Back to Games</a>
	
	{#if game}
		<div class="validate-button-container">
			<Button 
				onclick={validateRootClaim} 
				disabled={isValidating}
			>
				{isValidating ? 'Validating...' : 'Validate'}
			</Button>
		</div>

		<div class="game-details">
			<table>
				<tbody>
					<tr>
						<td>Game Index:</td>
						<td>{game.index}</td>
					</tr>
					<tr>
						<td>Game Type:</td>
						<td><GameType value={game.gameType} /></td>
					</tr>
					<tr>
						<td>Game Status:</td>
						<td>
							<AsyncData promise={game.getStatus()} dataName="game status">
								{#snippet children({ data })}
									<GameStatus value={data} />
								{/snippet}
							</AsyncData>
						</td>
					</tr>
					<tr>
						<td>Game Address:</td>
						<td><Address address={game.address} /></td>
					</tr>
					<tr>
                        <td>Anchor State Registry:</td>
                        <td>
                            <AsyncData 
                                promise={game!.getAnchorStateRegsitryAddress()}
                                dataName="anchor state registry address"
                            >
                                {#snippet children({ data })}
									<Address address={data} />
	                            {/snippet}
                            </AsyncData>
                        </td>
                    </tr>
					<tr>
                        <td>MIPS VM:</td>
                        <td>
                            <AsyncData 
                                promise={game!.getMipsAddress()}
                                dataName="mips address"
                            >
                                {#snippet children({ data })}
									<Address address={data} />
	                            {/snippet}
                            </AsyncData>
                        </td>
                    </tr>
					<tr>
						<td>Created At:</td>
						<td>{game.createdAt.toLocaleString()}</td>
					</tr>
					<tr>
						<td>Root Claim:</td>
						<td class="root-claim">
							<AsyncData promise={game.getRootClaim()} dataName="root claim" />
							<ValidationIcon {isValid} {validationError} />
						</td>
					</tr>
					<tr>
						<td>Starting Block Number:</td>
						<td>
							<AsyncData promise={game.getStartingBlockNumber()} dataName="starting block number" />
						</td>
					</tr>
					<tr>
						<td>Starting Output Root:</td>
						<td>
							<AsyncData promise={game.getStartingRootHash()} dataName="starting output root" />
						</td>
					</tr>
					<tr>
						<td>Claim Block Number:</td>
						<td>
							<AsyncData promise={game.getL2BlockNumber()} dataName="L2 block number" />
						</td>
					</tr>
					{#await game.getL2BlockNumberChallenged()}
						<!-- Loading state handled by AsyncData component -->
					{:then challenged}
						{#if challenged}
							<tr>
								<td>Claim Block Number Challenger:</td>
								<td>
									<AsyncData
										promise={game.getL2BlockNumberChallenger()}
										dataName="L2 block number challenger"
									>
										{#snippet children({ data })}
											<Address address={data} />
										{/snippet}
									</AsyncData>
								</td>
							</tr>
						{/if}
					{/await}
					<tr>
						<td>L1 Head:</td>
						<td>
							<AsyncData promise={game.getL1Head()} dataName="L1 head">
								{#snippet children({ data })}
									<L1Block identifier={data} />
	                            {/snippet}
							</AsyncData>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-center text-lg text-gray-400 my-8 italic">Game not found</p>
	{/if}
</div>

<style>
	.container {
		position: relative;
		padding-top: 2rem;
	}

	.back-link {
		position: absolute;
		top: 0;
		left: 0;
		padding: 0.5rem;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

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

	.validate-button-container {
		position: absolute;
		top: 0;
		right: 0;
	}

	.root-claim {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
