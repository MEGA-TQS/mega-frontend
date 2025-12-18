import { When } from '@cucumber/cucumber';

// Booking-specific steps for date inputs
When('I fill the start date field', async function () {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];

    await this.page.locator('input[type="date"]').first().fill(startDate);
});

When('I fill the end date field', async function () {
    // Get date 3 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    const endDateStr = endDate.toISOString().split('T')[0];

    await this.page.locator('input[type="date"]').last().fill(endDateStr);
});

When('I set booking dates from {string} to {string}', async function (start, end) {
    await this.page.locator('input[type="date"]').first().fill(start);
    await this.page.locator('input[type="date"]').last().fill(end);
});
