import { setWorldConstructor, World, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30000);

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.browser = null;
        this.page = null;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    }
}

Before(async function () {
    const headless = this.parameters.headless !== false;
    this.browser = await chromium.launch({ headless });
    this.page = await this.browser.newPage();
    // Set navigation timeout
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
});

After(async function () {
    if (this.browser) {
        await this.browser.close();
    }
});

setWorldConstructor(CustomWorld);
