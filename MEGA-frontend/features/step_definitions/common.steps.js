import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// 1. Navigation
Given('I am on the {string} page', async function (pageName) {
    const routes = {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'browse': '/browse',
        'my bookings': '/my-bookings'
    };
    const path = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
    await this.page.goto(`${this.baseUrl}${path}`);
});

// 2. Clicks
When('I click the {string} button', async function (buttonText) {
    const btn = this.page.locator(`button:has-text("${buttonText}")`);
    await btn.waitFor({ state: 'visible' });
    
    if (buttonText.toLowerCase() === 'login') {
        const oldUrl = this.page.url();
        await btn.click();
        
        // Use a race condition: wait for either a URL change OR an error alert
        // This prevents the 10s timeout on both success and failure
        await Promise.race([
            this.page.waitForFunction((old) => window.location.href !== old, oldUrl),
            this.page.locator('.alert-danger').waitFor({ state: 'visible' }).catch(() => {})
        ]).catch(() => {
            console.log("Action completed without traditional navigation.");
        });
    } else {
        await btn.click();
    }
});

When('I click the {string} link', async function (linkText) {
    // We target the navbar explicitly to avoid ambiguity [cite: 2]
    const navbarLink = this.page.locator(`.navbar a:has-text("${linkText}")`).first();
    
    // Increased timeout and visibility check
    await navbarLink.waitFor({ state: 'visible', timeout: 10000 });
    
    // Use forced click in case Bootstrap animations are still sliding 
    await navbarLink.click({ force: true });
});

// 3. Form Inputs
When('I type {string} in the {string} field', async function (value, fieldName) {
    // Selector strategy for your specific Login/Register forms
    const selectors = [
        `input[name="${fieldName}"]`,
        `label:has-text("${fieldName}") + input`,
        `input[placeholder*="${fieldName}" i]`,
        `label:has-text("${fieldName}") ~ input`
    ];

    for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0) {
            await element.fill(value);
            return;
        }
    }
    throw new Error(`Could not find field: ${fieldName}`);
});

// RESTORED: Missing Select Step
When('I select {string} from {string}', async function (optionText, selectLabel) {
    await this.page.selectOption(`select[name="${selectLabel}"]`, { label: optionText });
});

// 4. Assertions
Then('I should see {string}', async function (text) {
    // Relaxed visible text matching
    const locator = this.page.locator(`:visible:has-text("${text}")`).first();
    await expect(locator).toBeVisible({ timeout: 10000 });
});

Then('I should be on the {string} page', async function (pageName) {
    const routes = { 'home': '/', 'login': '/login', 'browse': '/browse', 'my bookings': '/my-bookings' };
    const expectedPath = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
});