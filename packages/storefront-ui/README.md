# @shopana/storefront-ui

Form and overlay primitives shared by the checkout and the sign-in screens
(`@shopana/storefront-auth/ui`). Built on antd 6 and antd-style: colors, fonts, sizes and radii
come from the antd tokens, so a theme restyles them with its `ConfigProvider`.

| Export                  | What it is                                                                    |
| ----------------------- | ----------------------------------------------------------------------------- |
| `FloatingLabelInput`    | antd `Input` with a floating label, 50px high                                 |
| `FloatingLabelPassword` | the same with a show / hide button                                            |
| `PhoneInput`            | international phone, flag inside the field; E.164 value; Ukraine by default   |
| `CountryPicker`         | searchable countries, the selected one first; popover, or a sheet on a phone  |
| `DrawerBase`, `Vaul`    | the vaul drawer of the cart and the checkout: right panel, bottom sheet below lg |
| `ResponsiveDialog`      | antd `Modal` on desktop, vaul bottom sheet below 768px                        |
| `Banner`                | message of the checkout and the sign-in: tone, title, text, one action, close |
| `BannerProvider`        | what a theme changes in every banner                                          |

`PhoneInput` is `react-phone-number-input` with its own `countrySelectComponent`; check the value
with `isPossiblePhoneNumber` (exported here). Country names come from the library's `en`, `ru`
and `ua` (Ukrainian) files by `locale`.

### Banner theme

`Banner` has four tones (`critical`, `warning`, `action`, `success`). A theme changes every
banner at once, the checkout's and the sign-in's alike:

- `BannerProvider` — `classNames` and `styles` of the parts (`root`, `icon`, `title`,
  `description`, `content`, `side`, `action`, `close`), `icons` of the tones and `tones` colors;
- CSS custom properties `--banner-<tone>-<background|border|text|accent>`, which win over both.

```tsx
<BannerProvider classNames={{ root: 'brand-banner' }} tones={{ action: { accent: '#1c49c2' } }}>
  {children}
</BannerProvider>
```

```bash
yarn workspace @shopana/storefront-ui build
yarn workspace @shopana/storefront-ui test
```
