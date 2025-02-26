<script lang="ts">
    import type { Snippet } from 'svelte';

    let visible = $state(false);
    interface Props {
        message?: string | null;
        children?: Snippet;
    }

    let { message = null, children }: Props = $props();
</script>

<div class="tooltip-container"
    role="tooltip"
    onmouseenter={() => visible = true}
    onmouseleave={() => visible = false}>
    {@render children?.()}
    {#if visible && message}
        <div class="tooltip">
            <p>{message}</p>
        </div>
    {/if}
</div>

<style>
    .tooltip-container {
        position: relative;
        display: inline-block;
    }

    .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px;
        background: white;
        color: #1f2937;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 10;
        margin-bottom: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 4px;
        border-style: solid;
        border-color: white transparent transparent transparent;
    }
</style> 