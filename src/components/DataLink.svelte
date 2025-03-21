<script lang="ts">
	import ExternalLinkIcon from './ExternalLinkIcon.svelte';
	import CopyButton from './CopyButton.svelte';
	interface Props {
		value: string;
		displayValue: string;
		title?: string;
		link: string;	
	}

	let { value, displayValue, title = `Link to: ${value}`, link }: Props = $props();
</script>

	<div class="data-container">
		<CopyButton value={value} />
		<a
			href={link}
			target="_blank"
			rel="noopener noreferrer"
			class="data-link"
			title={title}
		>
			<span class="display-value">{displayValue}</span>
			<span class="icon">
				<ExternalLinkIcon />
			</span>
		</a>
	</div>

<style>
	.data-container {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.data-link {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.data-link:hover .display-value {
		text-decoration: underline;
	}

	.display-value {
		font-family: monospace;
		font-size: 1em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.icon {
		opacity: 0;
	}

	.data-link:hover .icon {
		opacity: 1;
	}
</style>
