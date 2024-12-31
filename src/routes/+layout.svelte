<script lang="ts">
	import '../app.css';
	import Nav from '@components/Nav.svelte';
	let { children } = $props();
</script>
<Nav />
<div class="main-content">
	{@render children()}
</div>

<style>
	.main-content {
		margin: 2rem auto;
		max-width: 1200px;
		padding: 0 1rem;
	}
</style>
