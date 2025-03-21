<script lang="ts">
    import type { Snippet } from 'svelte';
    
    interface Props {
        disabled?: boolean;
        variant?: 'primary' | 'secondary';
        link?: string;
        onclick?: () => void;
        small?: boolean;
        children?: Snippet;
    }

    let {
        disabled = false,
        variant = 'primary',
        link,
        onclick,
        small = false,
        children
    }: Props = $props();
</script>

<button
    class="rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
    {variant === 'primary' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
    {small ? 'px-2 py-1 text-sm' : 'px-4 py-2'}"
    {disabled}
    onclick={onclick}
>
    {#if link && !disabled}
        <a href={link} class="w-full h-full hover:no-underline">
            {@render children?.()}
        </a>
    {:else}
        {@render children?.()}
    {/if}
</button> 