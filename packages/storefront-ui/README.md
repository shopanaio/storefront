# @shopana/storefront-ui

Form and overlay primitives shared by the checkout, the sign-in screens
(`@shopana/storefront-auth/ui`) and the themes. Built on antd 6 and antd-style: colors, fonts,
sizes and radii come from the antd tokens, so a theme restyles them with its `ConfigProvider`.

```ts
import { DrawerBase, PhoneInput, Banner } from '@shopana/storefront-ui';
// The same parts on their own entries:
import { PhoneInput } from '@shopana/storefront-ui/phone';
import {
  DrawerBase,
  Sheet,
  ResponsiveDialog,
} from '@shopana/storefront-ui/drawer';
import { Banner, BannerProvider } from '@shopana/storefront-ui/banner';
```

The package has no side effects (`"sideEffects": false`); the country names of a locale are loaded
on first use, each language its own chunk.

## Components

| Export                  | What it is                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `StorefrontUIProvider`  | locale, texts and the drawer container of every component under it                 |
| `FloatingLabelInput`    | antd `Input` with a floating label (`FLOATING_FIELD_HEIGHT`, 50px)                 |
| `FloatingLabelPassword` | the same with a show / hide button; a `suffix` of its own goes before it           |
| `PhoneInput`            | international phone, the flag inside the field; E.164 value                        |
| `CountryPicker`         | the device's select on phones and tablets; a keyboard listbox in a popover above   |
| `CountryFlag`           | the flag of a country in a 24×16 frame                                             |
| `Sheet`                 | the vaul drawer: a bottom sheet as tall as its content, or a side panel            |
| `DrawerBase`            | `Sheet` with a header (title, close button), a scrolling body and a footer in view |
| `ResponsiveDialog`      | antd `Modal` from a breakpoint up, a bottom sheet below it                         |
| `Banner`                | message: tone, title, text, one action, close                                      |
| `BannerProvider`        | what a theme changes in every banner                                               |
| `InlineLink`            | antd link button set in the line of a sentence                                     |
| `VisuallyHidden`        | text read out and not shown                                                        |

Helpers: `isEmail`, `isPossiblePhone`, `isValidPhone`, `formatPhoneInternational`; `breakpoints`,
`mq` (CSS at-rules), `queries` (media queries for `matchMedia`); hooks `useMediaQuery`,
`useBreakpointDown`, `useBannerTone`, `useDrawerLayer`.

### Styling

Every component takes antd 6's styling props: `className` and `style` of its root, and
`classNames` / `styles` keyed by its named parts (exported as `<Component>Part`):

| Component            | `root`                   | other parts                                                             |
| -------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `FloatingLabelInput` | the field with its error | `field` (antd input box), `input`, `prefix`, `suffix`, `label`, `error` |
| `PhoneInput`         | the picker and the field | `classNames` / `styles` go to the field's parts                         |
| `CountryPicker`      | the flag control         | `popup`, `list`, `option`                                               |
| `Sheet`              | the panel                | `overlay`, `handle`, `body`                                             |
| `DrawerBase`         | its column               | `sheet` (the panel), `header`, `title`, `body`, `footer`, `close`       |
| `ResponsiveDialog`   | the panel                | `header`, `title`, `body`, `footer`                                     |
| `Banner`             | the banner               | `icon`, `title`, `description`, `content`, `side`, `action`, `close`    |

`Banner`, `DrawerBase`, `ResponsiveDialog`, `Sheet`, `CountryPicker` and `CountryFlag` take a
`ref` and forward `id`, `aria-*` and `data-*` to their main element (the dialog element of a
drawer, the flag button of the picker).

### Texts and locale

`StorefrontUIProvider` gives the components their texts once, English by default: `dialog` (the
name of a drawer without a title), `close` (the close button of a drawer), `dismiss` (of a
banner), `showPassword` / `hidePassword`, and `countryPicker` (`title`,
`trigger(country, callingCode)`). `locale` picks the country names (`uk`, `ru`, `en`; English
for any other). `dialogMotion` (`zoom` by default, or `fade`) is how `ResponsiveDialog` opens
as a modal. A provider inside another one changes only what it sets; a component's own prop
(`closeLabel`, `dismissLabel`, `toggleLabels`, `pickerTexts`, `texts`, `locale`) wins over both.

```tsx
<StorefrontUIProvider
  locale="uk"
  texts={{
    close: 'Закрити',
    countryPicker: {
      trigger: (country, code) => `Країна: ${country}, +${code}`,
    },
  }}
>
  {children}
</StorefrontUIProvider>
```

### Phone

`PhoneInput` is `react-phone-number-input` with its own country picker and the floating-label
field; it takes the library's props (`countries`, `defaultCountry`, `onCountryChange`, …) and
the field's (`label`, `error`, `status`, `suffix`, …). No country is chosen by default: pass
`defaultCountry` for the store's market. Check the value with `isPossiblePhone` (length) or
`isValidPhone` (digits too), show it with `formatPhoneInternational`.

### Drawers and dialogs

- `DrawerBase` is a bottom sheet below `breakpoint` (`lg`) and a right panel above it. The close
  button shows on a panel and not in a sheet, which closes by dragging it down; `showCloseButton`
  changes that. The title (or `DrawerBase.Title` in a `header` of its own) names the drawer.
- `ResponsiveDialog` is a modal from `breakpoint` (`md`) up and a sheet below it, with the same
  `title`, content and `footer`.
- `CountryPicker` below `breakpoint` (`lg`: phones and tablets) is a transparent native `select`
  over the flag, so a tap opens the system picker. From it up, a popover with the countries, the
  selected one first: the list takes the focus, the arrows, Home and End move through it, letters
  jump to a name, Enter or Space picks one.
- A sheet opened from another nests in it. Drawers stand at antd's `zIndexPopupBase`; a dialog
  opened from a drawer stands over it by itself, and the country picker opens inside the drawer
  that traps the focus. Other popups use `useDrawerLayer()`: its `zIndex` to stand over the
  drawer and its `container` as their `getPopupContainer`.
- Drawers are portalled into `document.body`, or into `container` (a prop, or `drawerContainer`
  of `StorefrontUIProvider`) — e.g. the wrapper of a page that scales behind them.

### Breakpoints

`breakpoints` (`xs` 375 … `xxl` 1440) are the storefront's widths, not antd's. `mq.lg` and
`mq.max.lg` are CSS at-rules; `queries.below('lg')`, `queries.phone`, `queries.drawerSheet` are
queries for `useMediaQuery(query, { defaultValue })` and `useBreakpointDown('lg')`.
`defaultValue` (`false` by default) is what they return on the server and during hydration: a
host that knows the device from the user agent passes it, so a phone renders its layout from the
first paint.

### Banner theme

`Banner` has four tones (`critical`, `warning`, `action`, `success`), colored by the antd status
tokens (error, warning, info, success), in the dark algorithm too. A critical banner is an alert
and has no close. `action` is a link (`href`) or a button (`onClick` gets the event, `loading`
waits) from its description, or a control of its own.

`BannerProvider` changes every banner under it: `classNames` and `styles` of the parts, `icons`
of the tones and `tones` colors. A provider inside another one adds to it (classes add up,
styles, icons and colors override one by one); a banner's own `classNames` / `styles` win.
`useBannerTone(tone)` gives the colors of a tone as the banners draw them, for a control placed
in a banner (`extra`).

```tsx
<BannerProvider
  classNames={{ root: 'brand-banner' }}
  tones={{ action: { accent: '#1c49c2' } }}
>
  {children}
</BannerProvider>
```

```bash
yarn workspace @shopana/storefront-ui build
yarn workspace @shopana/storefront-ui test
```
