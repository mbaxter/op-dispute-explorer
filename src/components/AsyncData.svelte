<script lang="ts">
	import Spinner from './Spinner.svelte';
	import Tooltip from './Tooltip.svelte';
	import WarningIcon from './WarningIcon.svelte';

	export let promise: Promise<any>;
	export let dataName: string = 'data';
</script>

{#await promise}
	<Spinner />
{:then data}
	<slot {data}>
		<span>{data}</span>
	</slot>
{:catch error}
	<Tooltip>
		<WarningIcon />
		<svelte:fragment slot="content">
			<p>Error loading {dataName}</p>
		</svelte:fragment>
	</Tooltip>
{/await}
