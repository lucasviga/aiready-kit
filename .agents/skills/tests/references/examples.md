# Tests — examples

## AAA / Given-When-Then

```ts
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './order.pricing';

describe('calculateTotal', () => {
  it('applies a 10% coupon to the cart subtotal', () => {
    const cart = [{ price: 100, quantity: 2 }];
    const coupon = { percentOff: 10 };
    const total = calculateTotal({ cart, coupon });
    expect(total).toBe(180);
  });
});
```

Arrange = `cart` and `coupon`, Act = `calculateTotal`, Assert = `expect`. Per the code-standards skill there are no blank lines inside functions. The order of the three steps makes the structure clear.

## Fast — stub slow dependencies

Avoid — hits the real payment gateway:

```ts
it('charges the customer', async () => {
  const result = await checkout(cart, new StripeGateway());
  expect(result.ok).toBe(true);
});
```

Prefer — a stub that returns a fixed answer:

```ts
it('marks the order as paid when the gateway approves the charge', async () => {
  const gateway: PaymentGateway = { charge: vi.fn().mockResolvedValue({ status: 'approved' }) };
  const order = await checkout({ cart, gateway });
  expect(order.status).toBe(OrderStatus.Paid);
});
```

## Independent — no shared mutable state

Avoid — test 2 only passes if test 1 ran first:

```ts
const repo = new InMemoryUserRepository();
it('creates a user', () => { repo.save(user); });
it('finds the user', () => { expect(repo.find(user.id)).toEqual(user); });
```

Prefer — each test builds its own state:

```ts
let repo: InMemoryUserRepository;

beforeEach(() => {
  repo = new InMemoryUserRepository();
});

it('finds a saved user by id', () => {
  repo.save(user);
  expect(repo.find(user.id)).toEqual(user);
});
```

## Repeatable — control time, randomness and APIs

```ts
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('expires a coupon after its end date', () => {
  const coupon = { endsAt: new Date('2026-01-14T23:59:59Z') };
  expect(isCouponValid(coupon)).toBe(false);
});

it('generates a deterministic order code', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  expect(generateOrderCode()).toBe('ORD-500000');
});
```

Mock an HTTP module whose response changes on every request:

```ts
vi.mock('../services/exchange-rate', () => ({
  fetchUsdRate: vi.fn().mockResolvedValue(5.25),
}));
```

## Self-validating — strong assertions

Avoid — passes even if the behavior is wrong:

```ts
it('creates an order', async () => {
  const order = await createOrder(input);
  expect(order).toBeDefined();
});
```

Prefer — checks the outcome and the side effects:

```ts
it('creates a pending order and reserves stock for each item', async () => {
  const order = await createOrder({ input, stock, repository });
  expect(order).toMatchObject({ status: OrderStatus.Pending, total: 250 });
  expect(stock.reserve).toHaveBeenCalledWith({ sku: 'SKU-1', quantity: 2 });
  expect(repository.create).toHaveBeenCalledTimes(1);
});

it('rejects an order when an item is out of stock', async () => {
  stock.reserve.mockRejectedValue(new OutOfStockError('SKU-1'));
  await expect(createOrder({ input, stock, repository })).rejects.toThrow(OutOfStockError);
  expect(repository.create).not.toHaveBeenCalled();
});
```

## Focused — one behavior per test

Avoid: `it('works', ...)` that checks login, profile update and logout at once.

Prefer: `it('rejects login with a wrong password')`, `it('locks the account after 5 failed attempts')`, `it('returns a session token on valid credentials')`.

## Prioritize by criticality

| Priority | Example flows | Target |
|----------|---------------|--------|
| P0 | checkout, payment, auth, permissions | unit + integration + E2E, every edge case |
| P1 | cart, search, order history | unit + integration |
| P2 | admin CRUD (e.g. product categories), static pages | unit for logic only |
