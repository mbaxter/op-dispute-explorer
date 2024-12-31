<script lang="ts">
    import { network } from '@stores/network';
    import GameList from '@components/GameList.svelte';
</script>


{#if $network}
    <div>
        <GameList />
    </div>
{:else}
    <h1 class="text-gray-400 italic text-center text-lg">Please connect to a network by selecting a network from the dropdown in the top right</h1>
{/if}
