<script lang="ts">
	import { network } from '@stores/network';
	import DataLink from './DataLink.svelte';
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

	let link = $derived(`${$network!.l1BlockExplorer}/address/${address}`);
</script>

{#if address !== '0x0000000000000000000000000000000000000000'}
	<DataLink value={address} displayValue={displayAddress} title={address} link={link} />
{/if}
