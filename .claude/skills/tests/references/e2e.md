# E2E with Playwright

## Location

E2E tests live in a root `e2e/` folder, **outside** `frontend/` and `backend/`, because they test the system as a whole:

```
repo/
  frontend/
  backend/
  e2e/
    playwright.config.ts
    package.json
    fixtures/        test data and auth helpers
    pages/           page objects
    tests/
      checkout.spec.ts
      login.spec.ts
```

## Rules

- Only critical journeys (P0): sign-up/login, checkout, payment, anything that loses money or data when broken.
- Find elements by role or label (`getByRole`, `getByLabel`), never by CSS class.
- Never use fixed waits (`waitForTimeout`). Rely on auto-waiting and `expect(...).toBeVisible()`.
- Every test creates its own data (API seeding or fixtures) and does not depend on other tests.
- Use page objects to keep specs short and readable.

## Example

```ts
import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../pages/checkout.page';
import { seedCartWithItem } from '../fixtures/cart';

test('customer completes checkout with a credit card', async ({ page, request }) => {
  const cart = await seedCartWithItem({ request, sku: 'SKU-1' });
  const checkout = new CheckoutPage(page);
  await checkout.open(cart.id);
  await checkout.payWithCard({ number: '4242424242424242', expiry: '12/30', cvc: '123' });
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});
```

```ts
import type { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open(cartId: string): Promise<void> {
    await this.page.goto(`/checkout/${cartId}`);
  }

  async payWithCard(card: { number: string; expiry: string; cvc: string }): Promise<void> {
    await this.page.getByLabel('Card number').fill(card.number);
    await this.page.getByLabel('Expiry').fill(card.expiry);
    await this.page.getByLabel('CVC').fill(card.cvc);
    await this.page.getByRole('button', { name: 'Pay' }).click();
  }
}
```
