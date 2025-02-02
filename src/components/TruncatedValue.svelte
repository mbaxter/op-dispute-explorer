<script lang="ts">
	import CopyIcon from './CopyIcon.svelte';
	import Tooltip from './Tooltip.svelte';

	export let value: string;
	export let maxLength = 20;

	$: displayValue = value.length > maxLength ? value.slice(0, maxLength) + '...' : value;

	function copyToClipboard() {
		navigator.clipboard.writeText(value);
	}
</script>

<button type="button" class="value-button" on:click={copyToClipboard}>
	<Tooltip>
		<span>{displayValue}</span>
		<svelte:fragment slot="content">{value}</svelte:fragment>
	</Tooltip>
	<div class="copy-icon">
		<CopyIcon />
	</div>
</button>

<style>
	.value-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		background: none;
		border: none;
		padding: 0 4px;
		font-family: monospace;
		color: inherit;
		cursor: pointer;
	}

	.copy-icon {
		opacity: 0;
		flex-shrink: 0;
	}

	.value-button:hover span {
		text-decoration: underline;
	}

	.value-button:hover .copy-icon {
		opacity: 1;
	}
</style>
