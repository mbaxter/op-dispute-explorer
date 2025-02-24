<script lang="ts">
	import CopyIcon from './CopyIcon.svelte';
	import Tooltip from './Tooltip.svelte';

	export let value: string;
	
	let copyTooltipText = 'copy';

	async function copyToClipboard() {
		await navigator.clipboard.writeText(value);
		copyTooltipText = 'copied';
		setTimeout(() => {
			copyTooltipText = 'copy';
		}, 2000);
	}
</script>

<button type="button" class="copy-button" on:click={copyToClipboard}>
	<Tooltip message={copyTooltipText}>
		<div class="copy-icon">
			<CopyIcon />
		</div>
	</Tooltip>
</button>

<style>
	.copy-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.copy-icon {
		flex-shrink: 0;
	}
</style> 