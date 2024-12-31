<script lang="ts">
    export let disabled = false;
    export let variant: 'primary' | 'secondary' = 'primary';
    export let onclick: () => void;
    export let small = false;
</script>

<button
    class="rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
    {variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}
    {small ? 'px-2 py-1 text-sm' : 'px-4 py-2'}"
    {disabled}
    onclick={onclick}
>
    <slot />
</button> 