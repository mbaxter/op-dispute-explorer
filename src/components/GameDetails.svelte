<script lang="ts">
	import { games } from '@stores/games';
	import AsyncData from './AsyncData.svelte';
	import Address from './Address.svelte';
	import { OutputRootError } from '@lib/op/output-root';
	import ValidationIcon from './ValidationIcon.svelte';
	import Button from './Button.svelte';
	import { BlockNotFoundError } from '@lib/blocks';
	export let index: number;

	$: game = $games.get(index);
	$: if (game) {
		// Pre-fetch these async values
		game.getL1Head();
		game.getStatus();
		game.getL2BlockNumberChallenged();
		game.getL2BlockNumberChallenger();
	}

	let isValidating = false;
	let isValid: boolean | null = null;
	let validationError: string | null = null;

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
	<a href="/games" class="back-link">← Back to Games</a>
	
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
						<td>{game.gameType}</td>
					</tr>
					<tr>
						<td>Game Status:</td>
						<td><AsyncData promise={game.getStatus()} dataName="game status" /></td>
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
                                <svelte:fragment let:data>
                                    <Address address={data} />
                                </svelte:fragment>
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
                                <svelte:fragment let:data>
                                    <Address address={data} />
                                </svelte:fragment>
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
						<td>L2 Block Number:</td>
						<td>
							<AsyncData promise={game.getL2BlockNumber()} dataName="L2 block number" />
						</td>
					</tr>
					<tr>
						<td>L1 Head:</td>
						<td>
							<AsyncData promise={game.getL1Head()} dataName="L1 head" />
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
					{#await game.getL2BlockNumberChallenged()}
						<!-- Loading state handled by AsyncData component -->
					{:then challenged}
						{#if challenged}
							<tr>
								<td>L2 Block Number Challenger:</td>
								<td>
									<AsyncData
										promise={game.getL2BlockNumberChallenger()}
										dataName="L2 block number challenger"
									>
										<svelte:fragment let:data>
											<Address address={data} />
										</svelte:fragment>
									</AsyncData>
								</td>
							</tr>
						{/if}
					{/await}
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
		color: var(--link-color, #0066cc);
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
