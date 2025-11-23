import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SectionProps } from './types';
import { Section } from './Section';

// Mock logger to avoid console noise in tests
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

// Mock section components
const MockSectionComponent = ({ id, settings }: SectionProps<{ title: string }>) => (
  <div data-testid={`section-${id}`}>
    Section {id}: {settings.title}
  </div>
);

const ErrorThrowingSectionComponent = () => {
  throw new Error('Section render error');
};

describe('Section', () => {
  it('renders section component with props', () => {
    render(
      <Section
        component={MockSectionComponent}
        id="hero"
        settings={{ title: 'Hero Section' }}
        data={{ test: 'data' }}
      />,
    );

    expect(screen.getByTestId('section-hero')).toBeInTheDocument();
    expect(screen.getByText('Section hero: Hero Section')).toBeInTheDocument();
  });

  it('passes all props to section component', () => {
    const TestSection = ({ id, settings, blocks, data }: SectionProps) => (
      <div data-testid="test-section">
        <div>ID: {id}</div>
        <div>Settings: {JSON.stringify(settings)}</div>
        <div>Blocks: {blocks?.length ?? 0}</div>
        <div>Data: {JSON.stringify(data)}</div>
      </div>
    );

    const mockBlocks = [
      {
        id: 'block1',
        component: () => <div>Block</div>,
        settings: { text: 'Test' },
      },
    ];

    render(
      <Section
        component={TestSection}
        id="test-id"
        settings={{ key: 'value' }}
        blocks={mockBlocks}
        data={{ name: 'Test Data' }}
      />,
    );

    expect(screen.getByText('ID: test-id')).toBeInTheDocument();
    expect(screen.getByText('Settings: {"key":"value"}')).toBeInTheDocument();
    expect(screen.getByText('Blocks: 1')).toBeInTheDocument();
    expect(screen.getByText('Data: {"name":"Test Data"}')).toBeInTheDocument();
  });

  it('handles section component errors with ErrorBoundary', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Section
        component={ErrorThrowingSectionComponent}
        id="error-section"
        settings={{}}
        data={{}}
      />,
    );

    // ErrorBoundary should catch the error and render null
    expect(screen.queryByTestId('section-error-section')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders with undefined blocks', () => {
    const TestSection = ({ blocks }: SectionProps) => (
      <div data-testid="test-section">
        Blocks: {blocks ? 'defined' : 'undefined'}
      </div>
    );

    render(
      <Section
        component={TestSection}
        id="no-blocks"
        settings={{}}
        data={{}}
      />,
    );

    expect(screen.getByText('Blocks: undefined')).toBeInTheDocument();
  });

  it('renders with empty blocks array', () => {
    const TestSection = ({ blocks }: SectionProps) => (
      <div data-testid="test-section">
        Blocks count: {blocks?.length ?? 0}
      </div>
    );

    render(
      <Section
        component={TestSection}
        id="empty-blocks"
        settings={{}}
        blocks={[]}
        data={{}}
      />,
    );

    expect(screen.getByText('Blocks count: 0')).toBeInTheDocument();
  });

  it('renders section with complex settings', () => {
    interface ComplexSettings {
      title: string;
      nested: {
        value: number;
        array: string[];
      };
    }

    const ComplexSection = ({ settings }: SectionProps<ComplexSettings>) => (
      <div data-testid="complex-section">
        <div>{settings.title}</div>
        <div>Value: {settings.nested.value}</div>
        <div>Array: {settings.nested.array.join(', ')}</div>
      </div>
    );

    render(
      <Section
        component={ComplexSection}
        id="complex"
        settings={{
          title: 'Complex',
          nested: {
            value: 42,
            array: ['a', 'b', 'c'],
          },
        }}
        data={{}}
      />,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Value: 42')).toBeInTheDocument();
    expect(screen.getByText('Array: a, b, c')).toBeInTheDocument();
  });
});
