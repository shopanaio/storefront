import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PageTemplate, SectionProps, BlockProps } from './types';
import { Builder } from './Builder';

// Mock logger to avoid console noise in tests
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

// Mock components
const MockLayout = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-layout">{children}</div>
);

const MockSection = ({ id, settings }: SectionProps<{ title: string }>) => (
  <div data-testid={`section-${id}`}>
    Section: {settings.title}
  </div>
);

const MockBlock = ({ id, settings }: BlockProps<{ text: string }>) => (
  <div data-testid={`block-${id}`}>Block: {settings.text}</div>
);

describe('Builder', () => {
  it('renders layout with sections', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['hero'],
        hero: {
          component: MockSection,
          settings: { title: 'Hero Section' },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('section-hero')).toBeInTheDocument();
    expect(screen.getByText('Section: Hero Section')).toBeInTheDocument();
  });

  it('renders multiple sections in correct order', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['first', 'second', 'third'],
        first: {
          component: MockSection,
          settings: { title: 'First' },
        },
        second: {
          component: MockSection,
          settings: { title: 'Second' },
        },
        third: {
          component: MockSection,
          settings: { title: 'Third' },
        },
      },
    };

    const { container } = render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    const sections = container.querySelectorAll('[data-testid^="section-"]');
    expect(sections).toHaveLength(3);
    expect(sections[0]).toHaveAttribute('data-testid', 'section-first');
    expect(sections[1]).toHaveAttribute('data-testid', 'section-second');
    expect(sections[2]).toHaveAttribute('data-testid', 'section-third');
  });

  it('skips sections with invalid config', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['valid', 'missing', 'another-valid'],
        valid: {
          component: MockSection,
          settings: { title: 'Valid' },
        },
        'another-valid': {
          component: MockSection,
          settings: { title: 'Another Valid' },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('section-valid')).toBeInTheDocument();
    expect(screen.getByTestId('section-another-valid')).toBeInTheDocument();
    expect(screen.queryByTestId('section-missing')).not.toBeInTheDocument();
  });

  it('shows fallback when no sections are rendered', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: [],
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
        fallback={<div data-testid="fallback">No content</div>}
      />,
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-layout')).not.toBeInTheDocument();
  });

  it('shows fallback when all sections are invalid', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['missing1', 'missing2'],
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
        fallback={<div data-testid="fallback">No valid sections</div>}
      />,
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-layout')).not.toBeInTheDocument();
  });

  it('renders layout even without fallback and no sections', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: [],
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
  });

  it('handles sections with blocks', () => {
    const MockSectionWithBlocks = ({ blocks }: SectionProps) => (
      <div data-testid="section-with-blocks">
        {blocks?.map((block) => {
          const BlockComp = block.component;
          return <BlockComp key={block.id} {...block} />;
        })}
      </div>
    );

    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['main'],
        main: {
          component: MockSectionWithBlocks,
          settings: {},
          blocks: {
            order: ['block1', 'block2'],
            block1: {
              component: MockBlock,
              settings: { text: 'Block 1' },
            },
            block2: {
              component: MockBlock,
              settings: { text: 'Block 2' },
            },
          },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('section-with-blocks')).toBeInTheDocument();
    expect(screen.getByTestId('block-block1')).toBeInTheDocument();
    expect(screen.getByTestId('block-block2')).toBeInTheDocument();
    expect(screen.getByText('Block: Block 1')).toBeInTheDocument();
    expect(screen.getByText('Block: Block 2')).toBeInTheDocument();
  });

  it('skips blocks with invalid config', () => {
    const MockSectionWithBlocks = ({ blocks }: SectionProps) => (
      <div data-testid="section-with-blocks">
        {blocks?.map((block) => {
          const BlockComp = block.component;
          return <BlockComp key={block.id} {...block} />;
        })}
      </div>
    );

    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['main'],
        main: {
          component: MockSectionWithBlocks,
          settings: {},
          blocks: {
            order: ['block1', 'missing', 'block2'],
            block1: {
              component: MockBlock,
              settings: { text: 'Block 1' },
            },
            block2: {
              component: MockBlock,
              settings: { text: 'Block 2' },
            },
          },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('block-block1')).toBeInTheDocument();
    expect(screen.getByTestId('block-block2')).toBeInTheDocument();
    expect(screen.queryByTestId('block-missing')).not.toBeInTheDocument();
  });

  it('handles sections without blocks property', () => {
    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['simple'],
        simple: {
          component: MockSection,
          settings: { title: 'Simple Section' },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('section-simple')).toBeInTheDocument();
  });

  it('handles invalid sections.order (not an array)', () => {
    const template = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: 'invalid' as any,
        section1: {
          component: MockSection,
          settings: { title: 'Test' },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
        fallback={<div data-testid="fallback">Error</div>}
      />,
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('handles invalid blocks.order (not an array)', () => {
    const MockSectionWithBlocks = ({ blocks }: SectionProps) => (
      <div data-testid="section-with-blocks">
        Blocks count: {blocks?.length ?? 0}
      </div>
    );

    const template: PageTemplate = {
      layout: {
        component: MockLayout,
      },
      sections: {
        order: ['main'],
        main: {
          component: MockSectionWithBlocks,
          settings: {},
          blocks: {
            order: 'invalid' as any,
            block1: {
              component: MockBlock,
              settings: { text: 'Block 1' },
            },
          },
        },
      },
    };

    render(
      <Builder
        template={template}
        data={{ name: 'Test' }}
        pageType="home"
      />,
    );

    expect(screen.getByTestId('section-with-blocks')).toBeInTheDocument();
    expect(screen.getByText('Blocks count: 0')).toBeInTheDocument();
  });
});
