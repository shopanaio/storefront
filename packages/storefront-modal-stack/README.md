# @shopana/storefront-modal-stack

A stack of full-screen antd modals for Shopana themes: the Admin `ModalStack` with the same
styles, animations and URL projection. The package draws no inner layout (header, body,
buttons): the theme's component draws it.

## Setup

`ModalStack` goes once in the theme root, inside antd `App`, the next-intl provider and the
`@shopana/storefront` router:

```tsx
import { ModalStack } from '@shopana/storefront-modal-stack';
import { getModalStackItems } from '@src/modals';

<App>
  {children}
  <ModalStack items={getModalStackItems} />
</App>;
```

`items` are registered once on mount; the stack reads the URL after that. Types added later with
`registerModalStackItem` open too and restore from a link on registration. `fallback` replaces
the spinner shown while a lazy component loads.

## A modal

```tsx
const ProductModal = () => {
  const { payload, pop, setDirty } = useModalStackContext<'product'>();
  return <ThemeModalLayout onClose={pop}>…</ThemeModalLayout>;
};

{
  type: 'product',
  component: lazy(() => import('./ProductModal')),
  url: createModalUrlCodec({
    schema: z.object({ id: z.string().min(1) }),
    project: (payload) => ({ id: String(payload.entityId ?? '') }),
    restore: ({ id }) => ({ entityId: id }),
  }),
}
```

`useModalStackItem('product').push({ entityId }, { url: true })` opens it. A modal opened with
`url: true` is written to the query as `modals[0][type]=product&modals[0][id]=…`; without it, it
lives only at runtime. Other query parameters and the hash stay, browser history gets no entries
(`replaceState`), and a pathname change closes the modals of the previous page.

Closing (`pop`, Esc, a mask click) asks for confirmation when the modal or one opened on top of
it is dirty; while it is saving, closing is blocked. `useCopyModalStackUrl()` copies a link to
the first level of the stack.

Payload types are declared by augmentation:

```ts
declare module '@shopana/storefront-modal-stack' {
  interface ModalStackPayloads {
    product: { entityId: string };
  }
}
```

## Texts

Texts live in the next-intl namespace `ModalStack` with uk / ru / en defaults (`unsavedChanges`,
`unsavedChangesMessage`, `unsavedChildChangesMessage`, `leave`, `stay`, `loading`); a theme
overrides any of them in its own messages.
