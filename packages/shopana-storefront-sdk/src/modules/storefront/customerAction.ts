import type { SdkPlacementFieldsFragment } from '../../graphql/apollo/generated/operations';

export type PlaceOrderCustomerAction = NonNullable<
  SdkPlacementFieldsFragment['customerAction']
>;
export interface CustomerActionHandlers {
  clientSdk(
    sdk: string,
    params: object | null,
    action: PlaceOrderCustomerAction
  ): void | Promise<void>;
  redirect(url: string, action: PlaceOrderCustomerAction): void | Promise<void>;
  instructions(action: PlaceOrderCustomerAction): void | Promise<void>;
}

/** The app supplies provider integration, navigation, and presentation handlers. */
export async function handlePlaceOrderCustomerAction(
  action: PlaceOrderCustomerAction,
  handlers: CustomerActionHandlers
): Promise<void> {
  switch (action.type) {
    case 'CLIENT_SDK':
      if (!action.sdk)
        throw new Error('CLIENT_SDK action has no SDK identifier');
      await handlers.clientSdk(action.sdk, action.params ?? null, action);
      return;
    case 'REDIRECT':
      if (!action.url) throw new Error('REDIRECT action has no URL');
      await handlers.redirect(action.url, action);
      return;
    case 'INSTRUCTIONS':
      await handlers.instructions(action);
      return;
  }
}
