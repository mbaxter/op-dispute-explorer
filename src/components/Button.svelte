<script lang="ts">
    import type { Snippet } from 'svelte';
    
    interface Props {
        disabled?: boolean;
        variant?: 'primary' | 'secondary';
        onclick: () => void;
        small?: boolean;
        children?: Snippet;
    }

    let {
        disabled = false,
        variant = 'primary',
        onclick,
        small = false,
        children
    }: Props = $props();
</script>

<button
    class="rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
    {variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}
    {small ? 'px-2 py-1 text-sm' : 'px-4 py-2'}"
    {disabled}
    onclick={onclick}
>
    {@render children?.()}
</button> 