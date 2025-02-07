<script lang="ts">
    import { network } from '@stores/network';
</script>

{#if $network}
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Network Overview</h1>
        <!-- Add network stats and information here -->
    </div>
{:else}
    <h1 class="text-gray-400 italic text-center text-lg">Please connect to a network by selecting a network from the dropdown in the top right</h1>
{/if} 