<script lang="ts">
    import { network } from '@stores/network';
</script>

{#if $network}
    <slot />
{:else}
    <h1 class="text-gray-400 italic text-center text-lg">
        Please connect to a network by selecting a network from the dropdown in the top right
    </h1>
{/if} 