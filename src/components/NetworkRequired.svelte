<script lang="ts">
    import { network } from '@stores/network';
    import type { Snippet } from 'svelte';
    
    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

{#if $network}
    {@render children?.()}
{:else}
    <h1 class="text-gray-400 italic text-center text-lg">
        Please connect to a network by selecting a network from the dropdown in the top right
    </h1>
{/if} 