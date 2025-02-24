<script lang="ts">
    import Tooltip from './Tooltip.svelte';
    export let isValid: boolean | null = null;
    export let validationError: string | null = null;
</script>

{#if isValid !== null}
    <Tooltip message={validationError}>
        <span class="validation-icon" class:valid={isValid} class:invalid={!isValid}>
            {#if isValid}✓{:else}✗{/if}
        </span>
    </Tooltip>
{/if}

<style>
    .validation-icon {
        font-weight: bold;
        font-size: 1.2em;
    }

    .validation-icon.valid {
        color: var(--success-color, #28a745);
    }

    .validation-icon.invalid {
        color: var(--error-color, #dc3545);
    }
</style> 