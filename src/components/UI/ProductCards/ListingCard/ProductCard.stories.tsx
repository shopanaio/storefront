"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { ProductCard } from "./ProductCard";
import { mockProduct } from "@src/mocks/Product";

const meta: Meta<typeof ProductCard> = {
  title: "UI/ProductCard",
  component: ProductCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Product card for display in product list",
      },
    },
  },
  argTypes: {
    title: {
      control: "object",
      description: "Title settings",
    },
    hoverable: {
      control: "boolean",
      description: "Hover effect",
    },
    showRating: {
      control: "boolean",
      description: "Show rating",
    },
    showStockStatus: {
      control: "boolean",
      description: "Show stock status",
    },
  },
  args: {
    id: mockProduct.id,
    productTitle: mockProduct.title,
    handle: mockProduct.handle,
    rating: {
      rating: mockProduct.rating?.rating || 0,
      ratingCount: mockProduct.rating?.count || 0,
      className: undefined,
      size: "default",
      showRating: true,
      showCount: true,
      showReviewButton: true,
      compact: false,
      onReviewClick: () => {},
    },
    isAvailable: mockProduct.stockStatus?.isAvailable || false,
    price: {
      amount: mockProduct.price.amount,
      currencyCode: mockProduct.price.currencyCode,
    },
    compareAtPrice: mockProduct.compareAtPrice
      ? {
          amount: mockProduct.compareAtPrice.amount,
          currencyCode: mockProduct.compareAtPrice.currencyCode,
        }
      : undefined,
    swatches: [],
    title: {
      rows: 2,
      size: "default",
    },
    gallery: mockProduct.gallery?.edges?.map((edge) => edge.node.url) || [],
    hoverable: true,
    showRating: true,
    showStockStatus: true,
    isInCart: false,
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  args: {},
};

export const WithoutRating: Story = {
  args: {
    showRating: false,
  },
};

export const WithoutStockStatus: Story = {
  args: {
    showStockStatus: false,
  },
};

export const LargeTitle: Story = {
  args: {
    title: {
      rows: 3,
      size: "large",
    },
  },
};

export const SingleLineTitle: Story = {
  args: {
    title: {
      rows: 1,
      size: "default",
    },
  },
};

export const NotHoverable: Story = {
  args: {
    hoverable: false,
  },
};

export const OutOfStock: Story = {
  args: {
    isAvailable: false,
  },
};

export const WithDiscount: Story = {
  args: {
    price: {
      amount: 1200,
      currencyCode: mockProduct.price.currencyCode,
    },
    compareAtPrice: {
      amount: 1800,
      currencyCode: mockProduct.price.currencyCode,
    },
  },
};

export const ProductWithSwatches: Story = {
  args: {
    swatches: [
      {
        id: "gid://shopify/ProductOptionValue/1",
        handle: "red",
        iid: "uuid-1",
        title: "Red",
        swatch: null,
        isActive: false,
      },
      {
        id: "gid://shopify/ProductOptionValue/2",
        handle: "blue",
        iid: "uuid-2",
        title: "Blue",
        swatch: null,
        isActive: false,
      },
      {
        id: "gid://shopify/ProductOptionValue/3",
        handle: "green",
        iid: "uuid-3",
        title: "Green",
        swatch: null,
        isActive: false,
      },
    ],
  },
};
