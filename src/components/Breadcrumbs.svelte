<script lang="ts">
    import { getStores } from '$app/stores';
    const { page } = getStores();

    // Generate breadcrumbs from the current path
    const breadcrumbs = $page.url.pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, array) => {
            const path = '/' + array.slice(0, index + 1).join('/');
            return { name: segment, path };
        });
</script>

<nav class="p-2 bg-gray-50 border-t border-gray-200">
    <ol class="flex gap-2">
        <li><a href="/" class="text-blue-500">Home</a></li>
        {#each breadcrumbs as crumb, i}
            <li class="flex items-center">
                <span>/</span>
                <a href={crumb.path} class="text-blue-500">{crumb.name}</a>
            </li>
        {/each}
    </ol>
</nav>
