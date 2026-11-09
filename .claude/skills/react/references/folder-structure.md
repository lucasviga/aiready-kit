# React — folder structure

```
src/
  components/
    ProductCard/
      ProductCard.tsx
      ProductCard.test.tsx
    Button/
      Button.tsx
      Button.test.tsx
  views/
    CheckoutView/
      CheckoutView.tsx
      CheckoutView.test.tsx
  hooks/
    useCart.ts
    useCart.test.ts
  services/
    api.ts                axios/fetch instance, base URL from import.meta.env
    orders.service.ts
    orders.service.test.ts
  types/
    order.ts
    product.ts
  assets/
    logo.svg
  tests/
    render.tsx            custom render with providers
    factories.ts          buildOrder(), buildProduct()
  contexts/               optional: app-wide state (auth, theme)
  routes/                 optional: route definitions with lazy-loaded views
  utils/                  optional: pure helpers (formatCurrency)
```

## Import direction

```
views → components, hooks
hooks → services, types
services → types
components → types (never services)
```

A component that imports from `services/` is a sign that logic belongs in a hook.
