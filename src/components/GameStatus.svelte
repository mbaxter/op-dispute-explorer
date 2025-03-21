<script lang="ts">
	import Tooltip from "./Tooltip.svelte";

    export interface Props {
		value: String|number;
	}

	let { value }: Props = $props();
</script>

<Tooltip message={`Game Status: ${value.toString()}`}>
{#if value == '0'}
    In Progress
{:else if value == '1'}
    Challenger Wins
{:else if value == '2'}
    Defender Wins
{:else}
    Unknown
{/if}
</Tooltip>
