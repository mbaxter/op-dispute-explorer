import { expect, test } from '@playwright/test';

test('home page has expected elements', async ({ page }) => {
	await page.goto('/');

	// Check title
	await expect(page.locator('h1#title')).toHaveText('Dispute Game Explorer');

	// Check network dropdown exists
	await expect(page.locator('#network-select')).toBeVisible();
	await expect(page.locator('label[for="network-select"]')).toHaveText('Network:');

	// Check connection message
	await expect(page.locator('h1.text-gray-400')).toHaveText('Please connect to a network by selecting a network from the dropdown in the top right');
});
