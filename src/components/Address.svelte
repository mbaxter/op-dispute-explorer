<script lang="ts">
	import { network } from '@stores/network';
	import ExternalLinkIcon from './ExternalLinkIcon.svelte';
	export let address: string;
	export let maxLength: number | undefined = undefined;

	$: displayAddress =
		maxLength && address.length > maxLength
			? `${address.slice(0, maxLength / 2)}...${address.slice(-maxLength / 2)}`
			: address;
</script>

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

<style>
	.address-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
	}

	.address-link:hover {
		text-decoration: underline;
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
		transition: opacity 0.2s;
	}

	.address-link:hover .icon {
		opacity: 1;
	}
</style>
