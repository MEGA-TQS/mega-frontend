import { Given, Then } from '@cucumber/cucumber';

Given('I open {string}', async function (url) {
  await this.page.goto(url);
});

Then('I should see the page title {string}', async function (expectedTitle) {
  const title = await this.page.title();
  if (title !== expectedTitle) {
    throw new Error(`Expected title "${expectedTitle}" but got "${title}"`);
  }
});