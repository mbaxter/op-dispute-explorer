<script lang="ts">
	import GameDetails from '@components/GameDetails.svelte';
	import ClaimsList from '@components/ClaimsList.svelte';
	import { games } from '@stores/games';
	import NetworkRequired from '@components/NetworkRequired.svelte';

	export let data;
	$: game = $games.get(data.idx);
</script>

<NetworkRequired>
	<GameDetails index={data.idx} />

	{#if game}
		<ClaimsList {game} />
	{/if}
</NetworkRequired>


