<script lang="ts">
    import Tooltip from './Tooltip.svelte';
    interface Props {
        isValid?: boolean | null;
        validationError?: string | null;
    }

    let { isValid = null, validationError = null }: Props = $props();
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