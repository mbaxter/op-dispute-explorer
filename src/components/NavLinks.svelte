<script lang="ts">
    import { getStores } from '$app/stores';
    const { page } = getStores();

    const links = [
        { name: 'Overview', path: '/' },
        { name: 'Games', path: '/games' }
    ];

    // Helper function to check if current path matches or starts with link path
    function isActivePath(currentPath: string, linkPath: string): boolean {
        return currentPath === linkPath || 
               (currentPath.startsWith(linkPath) && currentPath[linkPath.length] === '/');
    }
</script>

<ul class="flex gap-4">
    {#each links as link}
        <li>
            <a 
                href={link.path} 
                class:font-bold={isActivePath($page.url.pathname, link.path)}
                class:text-blue-500={isActivePath($page.url.pathname, link.path)}
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
