"use client";

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Checkbox } from "antd";
import { Thumbnail } from "./Thumbnail";

const meta: Meta<typeof Thumbnail> = {
  title: "UI/Thumbnail",
  component: Thumbnail,
  parameters: { layout: "centered" },
  argTypes: {
    onClick: { action: "click" },
    onMouseOver: { action: "mouseOver" },
    overlay: { control: false },
    className: { control: false },
  },
  args: {
    src: "https://picsum.photos/seed/thumbnail/200",
    alt: "thumbnail",
  },
};

export default meta;
type Story = StoryObj<typeof Thumbnail>;

export const Default: Story = {
  args: {},
};

export const Selected: Story = {
  args: { selected: true },
};

export const Hovered: Story = {
  args: { hovered: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithOverlay: Story = {
  args: {
    overlay: <Checkbox checked />,
  },
};
