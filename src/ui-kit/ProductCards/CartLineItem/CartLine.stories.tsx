"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { CartLine } from "./CartLine";
import type { Money } from "@src/ui-kit/Price/Price";

export const mockCartLine = {
  id: "cart-line-1",
  title: "Premium Cotton T-Shirt",
  imageUrl:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
  quantity: 2,
  unitPrice: {
    amount: 2500,
    currencyCode: "RUB",
  } as Money,
  compareAtUnitPrice: {
    amount: 3500,
    currencyCode: "RUB",
  } as Money,
};

export const mockCartLineWithoutDiscount = {
  id: "cart-line-2",
  title: "Classic Jeans",
  imageUrl:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
  quantity: 1,
  unitPrice: {
    amount: 4500,
    currencyCode: "RUB",
  } as Money,
};

export const mockCartLineLargeQuantity = {
  id: "cart-line-3",
  title: "Sports Sneakers",
  imageUrl:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  quantity: 5,
  unitPrice: {
    amount: 8000,
    currencyCode: "RUB",
  } as Money,
  compareAtUnitPrice: {
    amount: 12000,
    currencyCode: "RUB",
  } as Money,
};

const meta: Meta<typeof CartLine> = {
  title: "UI/CartLine",
  component: CartLine,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Component for displaying product in cart",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["drawer", "page"],
      description: "Display variant",
    },
    quantity: {
      control: { type: "number", min: 1, max: 10 },
      description: "Product quantity",
    },
    onIncrement: { action: "increment" },
    onDecrement: { action: "decrement" },
    onRemove: { action: "remove" },
    onClick: { action: "click" },
  },
  args: {
    ...mockCartLine,
    variant: "drawer",
  },
};

export default meta;
type Story = StoryObj<typeof CartLine>;

export const Default: Story = {
  args: {},
};

export const PageVariant: Story = {
  args: {
    variant: "page",
  },
};

export const WithoutDiscount: Story = {
  args: {
    ...mockCartLineWithoutDiscount,
  },
};

export const LargeQuantity: Story = {
  args: {
    ...mockCartLineLargeQuantity,
  },
};

export const SingleItem: Story = {
  args: {
    ...mockCartLine,
    quantity: 1,
  },
};

export const HighQuantity: Story = {
  args: {
    ...mockCartLine,
    quantity: 10,
  },
};

export const LongTitle: Story = {
  args: {
    ...mockCartLine,
    title:
      "Very long product name that might not fit in one line and will require wrapping",
  },
};

export const WithHighPrice: Story = {
  args: {
    ...mockCartLine,
    unitPrice: {
      amount: 25000,
      currencyCode: "RUB",
    },
    compareAtUnitPrice: {
      amount: 35000,
      currencyCode: "RUB",
    },
  },
};

export const DifferentCurrency: Story = {
  args: {
    ...mockCartLine,
    unitPrice: {
      amount: 25.99,
      currencyCode: "USD",
    },
    compareAtUnitPrice: {
      amount: 35.99,
      currencyCode: "USD",
    },
  },
};
