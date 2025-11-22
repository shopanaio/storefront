import type { SectionProps } from '../core/types';
import type { PageTemplate } from '../core/types';
import type { StaticPageData } from '../sdk/types';

type EmptySettings = Record<string, never>;

function StaticPageSection({ data }: SectionProps<EmptySettings, StaticPageData>) {
  return (
    <section style={{ padding: '2rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>{data.page.title}</h1>
      <p style={{ color: '#555', lineHeight: 1.6 }}>{data.page.body}</p>
    </section>
  );
}

export const staticPageTemplate: PageTemplate<StaticPageData> = {
  name: 'page',
  sections: [
    {
      id: 'page-body',
      component: StaticPageSection,
      settings: {},
    },
  ],
};
