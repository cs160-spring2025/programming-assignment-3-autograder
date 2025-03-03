import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/part1/index.html");
});

test(
  "Navigate to all pages",
  {
    annotation: {
      type: "points",
      description: "3", // dear students: please don't change this lol
    },
  },
  // Change the following function to navigate and interact with your UI
  async ({ page }) => {
    // This is an example navigating the skeleton code that we provided.
    // Please change this to navigate your specific design

    // First, remove this line -- this will be a way to test that you've
    // correctly included the test file in your submission.
    expect(false, 'Be sure to include part1.spec.js in your submission!').toBeTruthy();

    // You can find elements in various ways
    // Looking for specific text
    await page.getByText("Project A").click();
    // Using a selector
    await page.locator("#add-task").click();
    // By role
    await page.getByRole("button").click();

    await page.locator("#add-task").click();
    await page.getByText("Finish").click();

    // "clicking" on a div to navigate works the same way as links
    await page.getByText("Back").click();

    // Don't forget to demonstrate filling out the task form!
  }
);

