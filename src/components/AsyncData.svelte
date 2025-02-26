<script lang="ts">
	import Spinner from './Spinner.svelte';
	import Tooltip from './Tooltip.svelte';
	import WarningIcon from './WarningIcon.svelte';
	import type { Snippet } from 'svelte';
	
	interface Props {
		promise: Promise<any>;
		dataName?: string;
		children?: Snippet<[any]>;
	}

	let { promise, dataName = 'data', children }: Props = $props();
</script>

{#await promise}
	<Spinner />
{:then data}
	{#if children}
		{@render children({ data, dataName })}
	{:else}
		<span>{data}</span>
	{/if}
{:catch error}
	<Tooltip message="Error loading {dataName}">
		<WarningIcon />
	</Tooltip>
{/await}
