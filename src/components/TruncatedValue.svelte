<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		value: string;
		maxLength?: number;
	}

	let { value, maxLength = 20 }: Props = $props();
	
	let displayValue = $derived(value.length > maxLength ? value.slice(0, maxLength) + '...' : value);
</script>

<div class="truncated-container">
	<Tooltip message={value}>
		<span>{displayValue}</span>
	</Tooltip>
	<CopyButton {value} />
</div>

<style>
	.truncated-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0 4px;
		font-family: monospace;
		color: inherit;
	}
</style>
