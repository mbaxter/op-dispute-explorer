<script lang="ts">
    import { opChain } from '@stores/network';
    import NetworkRequired from './NetworkRequired.svelte';
    import AsyncData from './AsyncData.svelte';
    import Address from './Address.svelte';
	import Button from './Button.svelte';
	import GameType from './GameType.svelte';
</script>

<NetworkRequired>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Network Overview</h1>
            <Button link="/games">View Games</Button>
        </div>
        
        <div class="network-details">
            <table>
                <tbody>
                    <tr>
                        <td>Respected Game Type:</td>
                        <td>
                            <AsyncData 
                                promise={$opChain!.getRespectedGameType()}
                                dataName="respected game type" 
                            >
                                {#snippet children({ data })}
                                    <GameType value={data} />
                                {/snippet}
                            </AsyncData>
                        </td>
                    </tr>
                    <tr>
                        <td>Is Paused:</td>
                        <td>
                            <AsyncData 
                                promise={$opChain!.isPaused()}
                                dataName="is paused"
                            />
                    </tr>
                    <tr>
                        <td>Dispute Game Factory:</td>
                        <td>
                            <AsyncData 
                                promise={$opChain!.getDisputeGameFactory()
                                    .then(factory => factory.getAddress())}
                                dataName="dispute game factory"
                            >
                                {#snippet children({ data })}
                                    <Address address={data} />
                                {/snippet}
                            </AsyncData>
                        </td>
                    </tr>
                    <tr>
                        <td>Portal:</td>
                        <td>
                            <AsyncData 
                                promise={$opChain!.getPortalContractAddress()}
                                dataName="portal contract address"
                            >
                                {#snippet children({ data })}
                                    <Address address={data} />
                                 {/snippet}
                            </AsyncData>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</NetworkRequired>

<style>
    .network-details {
        padding: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    td {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border-color, #ddd);
    }

    td:first-child {
        font-weight: bold;
        width: 200px;
    }
</style> 