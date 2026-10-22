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

`PhoneInput` is `react-phone-number-input` with its own `countrySelectComponent`; check the value
with `isPossiblePhoneNumber` (exported here). Country names come from the library's `en`, `ru`
and `ua` (Ukrainian) files by `locale`.

```bash
yarn workspace @shopana/storefront-ui build
yarn workspace @shopana/storefront-ui test
```
