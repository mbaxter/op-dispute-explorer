<script lang="ts">
	import Tooltip from "./Tooltip.svelte";

    export interface Props {
		value: String|number;
	}

	let { value }: Props = $props();
</script>

<Tooltip message={`Game Type: ${value.toString()}`}>
{#if value == '0'}
    Cannon
{:else if value == '1'}
    Permissioned
{:else}
    Unknown
{/if}
</Tooltip>
