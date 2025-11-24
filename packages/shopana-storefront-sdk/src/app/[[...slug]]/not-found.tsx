import type { PageTemplate, LayoutProps } from '@shopana/storefront-sdk/core';
import { Builder } from '@shopana/storefront-sdk/core';

interface NotFoundData {}

const notFoundTemplate: PageTemplate<NotFoundData> = {
  layout: {
    component: function NotFoundLayout({ children }: LayoutProps) {
      return <main>{children}</main>;
    },
  },
  sections: {
    order: [],
  },
};

export default function NotFound() {
  const data: NotFoundData = {};

  return (
    <Builder
      template={notFoundTemplate}
      data={data}
      pageType="404"
    />
  );
}
