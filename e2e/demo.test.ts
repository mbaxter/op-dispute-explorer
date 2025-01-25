import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('h1#title');
	await expect(page.locator('h1#title')).toBeVisible();
});
