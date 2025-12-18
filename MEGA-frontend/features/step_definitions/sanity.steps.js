import { Given, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

let browser;
let page;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

AfterAll(async () => {
  await browser.close();
});

Given('I open {string}', async (url) => {
  await page.goto(url);
});

Then('I should see the page title {string}', async (expectedTitle) => {
  const title = await page.title();
  if (title !== expectedTitle) {
    throw new Error(`Expected title "${expectedTitle}" but got "${title}"`);
  }
});