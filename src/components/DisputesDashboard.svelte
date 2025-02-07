<script lang="ts">
    import NetworkRequired from './NetworkRequired.svelte';
    import GameList from '@components/GameList.svelte';
</script>

<NetworkRequired>
    <div>
        <GameList />
    </div>
</NetworkRequired>
