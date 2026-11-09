# JavaScript / TypeScript — examples

## Never use var

Avoid:

```js
var total = 0;
for (var i = 0; i < items.length; i++) total += items[i].price;
```

Prefer:

```ts
const total = items.reduce((sum, item) => sum + item.price, 0);
let attempts = 0;
```

## Strict equality

Avoid:

```js
if (status == 1) {}
if (value != null) {}
if ('' == 0) {}
```

Prefer:

```ts
if (status === Status.Active) {}
if (value !== null && value !== undefined) {}
const name = input ?? DEFAULT_NAME;
```

## Always use types

Avoid:

```ts
function parse(data: any) {
  return data.items;
}
```

Prefer:

```ts
interface OrderPayload {
  items: OrderItem[];
}

function parseOrder(data: unknown): OrderPayload {
  if (!isOrderPayload(data)) throw new InvalidPayloadError();
  return data;
}
```

## Arrow functions only for callbacks

Avoid — main function as an arrow, callback as a function expression:

```ts
export const calculateInvoice = (order: Order) => {
  return order.items.map(function (item) {
    return item.price * item.quantity;
  });
};
```

Prefer:

```ts
export function calculateInvoice(order: Order): InvoiceLine[] {
  return order.items.map((item) => ({ sku: item.sku, amount: item.price * item.quantity }));
}

button.addEventListener('click', (event) => handleClick(event));
const paid = orders.filter((order) => order.isPaid);
```

## Ternaries without nesting

Avoid:

```ts
const label = score > 90 ? 'A' : score > 70 ? 'B' : score > 50 ? 'C' : 'F';
```

Prefer — a guard-clause function:

```ts
function gradeFor(score: number): Grade {
  if (score > 90) return 'A';
  if (score > 70) return 'B';
  if (score > 50) return 'C';
  return 'F';
}
```

Or a lookup object for value mapping:

```ts
const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Waiting for payment',
  [OrderStatus.Paid]: 'Paid',
  [OrderStatus.Shipped]: 'On the way',
};

const label = STATUS_LABEL[order.status];
```

A single ternary is fine: `const icon = isOpen ? 'chevron-up' : 'chevron-down';`

## Typed parameters and return objects

Avoid — positional params and a tuple return:

```ts
function paginate(items, page, size, sort) {
  return [items.slice(page * size, (page + 1) * size), items.length];
}
const [rows, count] = paginate(users, 0, 20, 'name');
```

Prefer:

```ts
interface PaginateParams<T> {
  items: T[];
  page: number;
  pageSize: number;
}

interface PageResult<T> {
  rows: T[];
  total: number;
  hasNextPage: boolean;
}

function paginate<T>({ items, page, pageSize }: PaginateParams<T>): PageResult<T> {
  const start = page * pageSize;
  const rows = items.slice(start, start + pageSize);
  return { rows, total: items.length, hasNextPage: start + pageSize < items.length };
}

const { rows, hasNextPage } = paginate({ items: users, page: 0, pageSize: 20 });
```
