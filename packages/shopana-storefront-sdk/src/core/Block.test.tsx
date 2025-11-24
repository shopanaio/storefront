import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BlockProps } from './types';
import { Block } from './Block';

// Mock logger to avoid console noise in tests
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

// Mock block components
const MockBlockComponent = ({ id, settings }: BlockProps<{ text: string }>) => (
  <div data-testid={`block-${id}`}>
    Block {id}: {settings.text}
  </div>
);

const ErrorThrowingBlockComponent = () => {
  throw new Error('Block render error');
};

describe('Block', () => {
  it('renders block component with props', () => {
    render(
      <Block
        component={MockBlockComponent}
        id="text-block"
        settings={{ text: 'Hello World' }}
      />,
    );

    expect(screen.getByTestId('block-text-block')).toBeInTheDocument();
    expect(screen.getByText('Block text-block: Hello World')).toBeInTheDocument();
  });

  it('passes all props to block component', () => {
    const TestBlock = ({ id, settings }: BlockProps) => (
      <div data-testid="test-block">
        <div>ID: {id}</div>
        <div>Settings: {JSON.stringify(settings)}</div>
      </div>
    );

    render(
      <Block
        component={TestBlock}
        id="test-id"
        settings={{ key: 'value', number: 123 }}
      />,
    );

    expect(screen.getByText('ID: test-id')).toBeInTheDocument();
    expect(screen.getByText('Settings: {"key":"value","number":123}')).toBeInTheDocument();
  });

  it('handles block component errors with ErrorBoundary', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Block
        component={ErrorThrowingBlockComponent}
        id="error-block"
        settings={{}}
      />,
    );

    // ErrorBoundary should catch the error and render null
    expect(screen.queryByTestId('block-error-block')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders with empty settings', () => {
    const TestBlock = ({ settings }: BlockProps) => (
      <div data-testid="test-block">
        Settings: {Object.keys(settings).length}
      </div>
    );

    render(
      <Block
        component={TestBlock}
        id="empty-settings"
        settings={{}}
      />,
    );

    expect(screen.getByText('Settings: 0')).toBeInTheDocument();
  });

  it('renders block with complex settings', () => {
    interface ComplexSettings {
      title: string;
      config: {
        enabled: boolean;
        items: Array<{ name: string; value: number }>;
      };
    }

    const ComplexBlock = ({ settings }: BlockProps<ComplexSettings>) => (
      <div data-testid="complex-block">
        <div>{settings.title}</div>
        <div>Enabled: {settings.config.enabled ? 'Yes' : 'No'}</div>
        <div>Items: {settings.config.items.length}</div>
      </div>
    );

    render(
      <Block
        component={ComplexBlock}
        id="complex"
        settings={{
          title: 'Complex Block',
          config: {
            enabled: true,
            items: [
              { name: 'Item 1', value: 1 },
              { name: 'Item 2', value: 2 },
            ],
          },
        }}
      />,
    );

    expect(screen.getByText('Complex Block')).toBeInTheDocument();
    expect(screen.getByText('Enabled: Yes')).toBeInTheDocument();
    expect(screen.getByText('Items: 2')).toBeInTheDocument();
  });

  it('renders multiple blocks independently', () => {
    const { container } = render(
      <>
        <Block
          component={MockBlockComponent}
          id="block1"
          settings={{ text: 'First' }}
        />
        <Block
          component={MockBlockComponent}
          id="block2"
          settings={{ text: 'Second' }}
        />
        <Block
          component={MockBlockComponent}
          id="block3"
          settings={{ text: 'Third' }}
        />
      </>,
    );

    const blocks = container.querySelectorAll('[data-testid^="block-"]');
    expect(blocks).toHaveLength(3);
    expect(screen.getByText('Block block1: First')).toBeInTheDocument();
    expect(screen.getByText('Block block2: Second')).toBeInTheDocument();
    expect(screen.getByText('Block block3: Third')).toBeInTheDocument();
  });

  it('handles numeric and boolean settings', () => {
    interface NumericSettings {
      count: number;
      price: number;
      enabled: boolean;
    }

    const NumericBlock = ({ settings }: BlockProps<NumericSettings>) => (
      <div data-testid="numeric-block">
        <div>Count: {settings.count}</div>
        <div>Price: ${settings.price}</div>
        <div>Enabled: {settings.enabled.toString()}</div>
      </div>
    );

    render(
      <Block
        component={NumericBlock}
        id="numeric"
        settings={{
          count: 5,
          price: 99.99,
          enabled: false,
        }}
      />,
    );

    expect(screen.getByText('Count: 5')).toBeInTheDocument();
    expect(screen.getByText('Price: $99.99')).toBeInTheDocument();
    expect(screen.getByText('Enabled: false')).toBeInTheDocument();
  });
});
