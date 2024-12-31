<script lang="ts">
    import { getStores } from '$app/stores';
    const { page } = getStores();

    const links = [
        { name: 'Home', path: '/' }
    ];
</script>

<ul class="flex gap-4">
    {#each links as link}
        <li>
            <a 
                href={link.path} 
                class:font-bold={$page.url.pathname === link.path}
                class:text-blue-500={$page.url.pathname === link.path}
            >
                {link.name}
            </a>
        </li>
    {/each}
</ul>

<style>
    a {
        text-decoration: none;
    }
    .font-bold {
        font-weight: bold;
    }
    .text-blue-500 {
        color: #3b82f6;
    }
</style>
