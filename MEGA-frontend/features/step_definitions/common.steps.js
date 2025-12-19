import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Navigation steps
Given('I am on the {string} page', async function (pageName) {
    const routes = {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'browse': '/browse',
        'my bookings': '/my-bookings',
        'my listings': '/my-listings'
    };
    const path = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
    await this.page.goto(`${this.baseUrl}${path}`);
});

Given('I navigate to {string}', async function (url) {
    if (url.startsWith('http')) {
        await this.page.goto(url);
    } else {
        await this.page.goto(`${this.baseUrl}${url}`);
    }
});

// Click steps
When('I click the {string} button', async function (buttonText) {
    await this.page.click(`button:has-text("${buttonText}")`);
});

When('I click the {string} link', async function (linkText) {
    await this.page.click(`a:has-text("${linkText}")`);
});

When('I click on {string}', async function (text) {
    await this.page.click(`text=${text}`);
});

// Form input steps
When('I fill in {string} with {string}', async function (fieldLabel, value) {
    const input = this.page.locator(`input`).filter({ has: this.page.locator(`xpath=preceding-sibling::label[contains(text(),"${fieldLabel}")]`) }).first();

    // Try by placeholder first
    let element = this.page.locator(`input[placeholder*="${fieldLabel}" i]`).first();
    if (await element.count() === 0) {
        // Try by associated label
        element = this.page.locator(`label:has-text("${fieldLabel}")`).locator('..').locator('input').first();
    }
    if (await element.count() === 0) {
        // Try by name attribute
        element = this.page.locator(`input[name="${fieldLabel.toLowerCase()}" i]`).first();
    }

    await element.fill(value);
});

When('I type {string} in the {string} field', async function (value, fieldName) {
    const selectors = [
        `input[name="${fieldName}"]`,
        `input[placeholder*="${fieldName}" i]`,
        `label:has-text("${fieldName}") + input`,
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

// Updated select logic to handle the new Category dropdown
When('I select {string} from {string}', async function (optionText, selectLabel) {
    // Select by name attribute (e.g., name="category")
    const select = this.page.locator(`select[name="${selectLabel}"]`).first();
    await select.selectOption({ label: optionText });
});

// Helper for price range inputs
When('I set the price range from {string} to {string}', async function (min, max) {
    await this.page.locator('input[name="minPrice"]').fill(min);
    await this.page.locator('input[name="maxPrice"]').fill(max);
});

// Assertion steps
Then('I should see {string}', async function (text) {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout: 5000 });
});

Then('I should see the text {string}', async function (text) {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout: 5000 });
});

Then('I should not see {string}', async function (text) {
    await expect(this.page.locator(`text=${text}`)).not.toBeVisible({ timeout: 5000 });
});

Then('the page title should be {string}', async function (expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
});

Then('I should be on the {string} page', async function (pageName) {
    const routes = {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'browse': '/browse',
        'my bookings': '/my-bookings'
    };
    const expectedPath = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
    await this.page.waitForURL(`**${expectedPath}**`, { timeout: 5000 });
});

Then('the URL should contain {string}', async function (urlPart) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
});

// Wait steps
When('I wait for {int} seconds', async function (seconds) {
    await this.page.waitForTimeout(seconds * 1000);
});

When('I wait for the page to load', async function () {
    await this.page.waitForLoadState('networkidle');
});
