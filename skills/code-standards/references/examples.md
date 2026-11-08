# Code standards — examples

Each section shows the code to **avoid** and the code to **prefer**.

## 1. Comments only when absolutely necessary

Avoid — the comment repeats the code:

```ts
// check if user is adult
if (user.age >= 18) {
  grantAccess(user);
}
```

Prefer — the name explains it:

```ts
const MINIMUM_ADULT_AGE = 18;

function isAdult(user: User): boolean {
  return user.age >= MINIMUM_ADULT_AGE;
}

if (isAdult(user)) {
  grantAccess(user);
}
```

Acceptable — a complex regular expression nobody can read at a glance:

```ts
// Brazilian CPF: 000.000.000-00 or 00000000000
const CPF_PATTERN = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
```

## 2. Files with at most 120 lines

Avoid — one `order.service.ts` with 400 lines mixing validation, pricing, persistence and email.

Prefer — split by responsibility:

```
orders/
  order.validator.ts      validates input
  order.pricing.ts        computes totals and discounts
  order.repository.ts     reads/writes the database
  order.notifier.ts       sends the confirmation email
  order.service.ts        orchestrates the steps above
```

## 3. Functions with at most 30 lines

Avoid — one function that validates, calculates and saves (60+ lines).

Prefer — an orchestrator calling small, named steps:

```ts
async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const cart = validateCart(input.cart);
  const total = calculateTotal({ cart, coupon: input.coupon });
  const order = await orderRepository.create({ customerId: input.customerId, cart, total });
  await notifyOrderPlaced(order);
  return order;
}
```

## 4. At most 2 nested if/else — use guard clauses

Avoid:

```ts
function getDiscount(user: User): number {
  if (user) {
    if (user.isActive) {
      if (user.plan === 'premium') {
        return 0.2;
      } else {
        return 0.05;
      }
    } else {
      return 0;
    }
  } else {
    throw new Error('User required');
  }
}
```

Prefer — early returns, flat flow:

```ts
const PREMIUM_DISCOUNT = 0.2;
const DEFAULT_DISCOUNT = 0.05;
const NO_DISCOUNT = 0;

function getDiscount(user?: User): number {
  if (!user) throw new Error('User required');
  if (!user.isActive) return NO_DISCOUNT;
  if (user.plan === Plan.Premium) return PREMIUM_DISCOUNT;
  return DEFAULT_DISCOUNT;
}
```

## 5. At most 3 parameters and no blank lines inside functions

Avoid:

```ts
function createUser(name: string, email: string, age: number, role: string, sendWelcome: boolean) {
  const user = { name, email, age, role };

  repository.save(user);

  if (sendWelcome) mailer.welcome(email);
}
```

Prefer — a typed parameter object, no blank lines in the body:

```ts
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  role: Role;
  sendWelcome: boolean;
}

function createUser(params: CreateUserParams): User {
  const user = buildUser(params);
  repository.save(user);
  if (params.sendWelcome) mailer.welcome(user.email);
  return user;
}
```

Blank lines **between** functions or class members are fine:

```ts
class Cart {
  private items: CartItem[] = [];

  add(item: CartItem): void {
    this.items.push(item);
  }

  total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

## 6. Extract magic numbers and strings

Avoid:

```ts
if (password.length < 8) throw new Error('weak');
setTimeout(retry, 300000);
if (order.status === 'PAID') ship(order);
```

Prefer:

```ts
const MIN_PASSWORD_LENGTH = 8;
const RETRY_DELAY_MS = 5 * 60 * 1000;

enum OrderStatus {
  Paid = 'PAID',
}

if (password.length < MIN_PASSWORD_LENGTH) throw new WeakPasswordError();
setTimeout(retry, RETRY_DELAY_MS);
if (order.status === OrderStatus.Paid) ship(order);
```

## 7. Declare variables where they are used

Avoid:

```ts
function report(orders: Order[]): Report {
  const now = new Date();
  const header = buildHeader();
  const paid = orders.filter((order) => order.isPaid);
  if (paid.length === 0) return emptyReport();
  const totals = sumTotals(paid);
  return { header, totals, generatedAt: now };
}
```

Prefer — nothing is computed before the early return:

```ts
function report(orders: Order[]): Report {
  const paid = orders.filter((order) => order.isPaid);
  if (paid.length === 0) return emptyReport();
  const totals = sumTotals(paid);
  return { header: buildHeader(), totals, generatedAt: new Date() };
}
```

## 8. Never put sensitive data in code

Avoid:

```ts
const stripe = new Stripe('sk_live_51H...');
const db = connect('postgres://admin:secret@prod-db:5432/app');
```

Prefer — `.env` (git-ignored) plus a committed `.env.example`:

```bash
# .env.example
STRIPE_SECRET_KEY=
DATABASE_URL=
```

```ts
import 'dotenv/config';

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
const db = connect(requireEnv('DATABASE_URL'));

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
```
