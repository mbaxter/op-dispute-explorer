<script lang="ts">
	import { network } from '@stores/network';
	import ExternalLinkIcon from './ExternalLinkIcon.svelte';
	import CopyButton from './CopyButton.svelte';
	interface Props {
		address: string;
		maxLength?: number | undefined;
	}

	let { address, maxLength = undefined }: Props = $props();

	let displayAddress = $derived(
		maxLength && address.length > maxLength
			? `${address.slice(0, maxLength / 2)}...${address.slice(-maxLength / 2)}`
			: address
	);
</script>

{#if address !== '0x0000000000000000000000000000000000000000'}
	<div class="address-container">
		<CopyButton value={address} />
		<a
			href="{$network!.l1BlockExplorer}/address/{address}"
			target="_blank"
			rel="noopener noreferrer"
			class="address-link"
			title={address}
		>
			<span class="address">{displayAddress}</span>
			<span class="icon">
				<ExternalLinkIcon />
			</span>
		</a>
	</div>
{/if}

<style>
	.address-container {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.address-link {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.address-link:hover .address {
		text-decoration: underline;
	}

	.external-link {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.address {
		font-family: monospace;
		font-size: 1em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.icon {
		opacity: 0;
	}

	.address-link:hover .icon {
		opacity: 1;
	}
</style>
