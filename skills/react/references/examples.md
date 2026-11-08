# React — examples

## Small, reusable, functional components (≤ 30 lines)

Avoid — a 150-line `ProductPage` that fetches, filters, renders the list, the cards and the modal.

Prefer — small components composed by a view:

```tsx
interface ProductCardProps {
  name: string;
  price: number;
  onAddToCart: () => void;
}

export function ProductCard({ name, price, onAddToCart }: ProductCardProps) {
  return (
    <article className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">{formatCurrency(price)}</p>
      <button
        type="button"
        onClick={onAddToCart}
        aria-label={`Add ${name} to cart`}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2"
      >
        Add to cart
      </button>
    </article>
  );
}
```

## No prop spreading

Avoid — hides what the component receives and leaks unknown attributes to the DOM:

```tsx
function Input(props: InputProps) {
  return <input {...props} />;
}
```

Prefer — explicit props:

```tsx
function Input({ id, label, value, onChange }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      {label}
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="rounded border px-3 py-2" />
    </label>
  );
}
```

## Avoid unnecessary useEffect

Avoid — state duplicated and synced with an effect:

```tsx
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer — derive during render:

```tsx
const fullName = `${firstName} ${lastName}`;
```

Avoid — an effect reacting to a user action:

```tsx
useEffect(() => {
  if (submitted) sendForm(data);
}, [submitted]);
```

Prefer — do it in the event handler:

```tsx
function handleSubmit() {
  sendForm(data);
}
```

## useMemo for heavy calculations

```tsx
export function SalesReport({ orders }: SalesReportProps) {
  const summary = useMemo(() => buildSalesSummary(orders), [orders]);
  return <SummaryTable rows={summary.rows} total={summary.total} />;
}
```

Don't wrap cheap expressions (`a + b`, string concatenation) in `useMemo`. If the project enables the React Compiler, it memoizes automatically, so keep `useMemo` only where profiling shows it helps.

## Backend access in services, logic in hooks

`services/orders.service.ts`:

```ts
import { api } from './api';
import type { Order } from '../types/order';

export async function listOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders');
  return response.data;
}
```

`hooks/useOrders.ts`:

```ts
import { useEffect, useState } from 'react';
import { listOrders } from '../services/orders.service';
import type { Order } from '../types/order';

export function useOrders(): { orders: Order[]; isLoading: boolean; error: Error | null } {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);
  return { orders, isLoading, error };
}
```

`views/OrdersView.tsx` — no API code, only composition:

```tsx
export function OrdersView() {
  const { orders, isLoading, error } = useOrders();
  if (isLoading) return <Spinner label="Loading orders" />;
  if (error) return <ErrorMessage message="Could not load your orders." />;
  return <OrderList orders={orders} />;
}
```

## Accessibility

```tsx
<button type="button" aria-label="Close dialog" onClick={onClose} className="p-2">
  <XIcon aria-hidden="true" />
</button>

<div role="alert" aria-live="assertive" className="text-red-600">
  {errorMessage}
</div>

<nav aria-label="Main">
  <a href="/orders" aria-current={isCurrent ? 'page' : undefined}>Orders</a>
</nav>
```

Prefer a native element (`<button>`, `<nav>`, `<label>`) over a `div` with a `role`. Use `aria-*` to add what HTML can't express.
