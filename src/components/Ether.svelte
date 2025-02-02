<script lang="ts">
	export let wei: bigint;

	// Format the value in either wei or ether depending on size
	$: formattedValue = formatEther(wei);

	function formatEther(weiValue: bigint): string {
		const ETHER = 10n ** 18n; // 1 ether = 10^18 wei
		const MIN_ETHER = ETHER / 10000n; // 0.0001 ether

		if (weiValue >= MIN_ETHER) {
			// Convert to ether and format with up to 4 decimal places
			const ether = Number(weiValue) / Number(ETHER);
			return `${ether.toFixed(4)} ETH`;
		} else {
			// Show in wei
			return `${weiValue.toString()} wei`;
		}
	}
</script>

<span>{formattedValue}</span>
