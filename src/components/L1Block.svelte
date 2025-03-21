<script lang="ts">
	import { network } from '@stores/network';
	import DataLink from './DataLink.svelte';
	interface Props {
		identifier: string;
		maxLength?: number | undefined;
	}

	let { identifier, maxLength = undefined }: Props = $props();

	let displayValue = $derived(
		maxLength && identifier.length > maxLength
			? `${identifier.slice(0, maxLength / 2)}...${identifier.slice(-maxLength / 2)}`
			: identifier
	);

	let link = $derived(`${$network!.l1BlockExplorer}/block/${identifier}`);
</script>

<DataLink value={identifier} displayValue={displayValue} title={identifier} link={link} />
