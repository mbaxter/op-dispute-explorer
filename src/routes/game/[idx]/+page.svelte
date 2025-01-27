<script>
	import GameDetails from '@components/GameDetails.svelte';

	let { data } = $props();
</script>

<GameDetails index={data.idx} />