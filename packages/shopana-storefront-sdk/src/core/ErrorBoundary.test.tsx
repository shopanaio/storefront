import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ErrorBoundary,
  SectionErrorBoundary,
  BlockErrorBoundary,
} from './ErrorBoundary';

// Mock logger - must be before the mock call
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

// Import the mocked function
import { logError as mockLogError } from '../utils/logger';

// Test components
const WorkingComponent = () => <div data-testid="working">Working</div>;

const ErrorComponent = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockLogError.mockClear();
  });

  describe('BaseErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('working')).toBeInTheDocument();
    });

    it('catches errors and renders null', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.queryByTestId('working')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('logs error when component throws', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary componentName="TestComponent">
          <ErrorComponent message="Custom error" />
        </ErrorBoundary>,
      );

      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          error: expect.any(Error),
          component: 'TestComponent',
          boundary: 'global',
          extra: expect.objectContaining({
            info: expect.any(Object),
          }),
        }),
      );

      consoleSpy.mockRestore();
    });

    it('handles multiple children', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('isolates error to boundary scope', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <div>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
          <div data-testid="outside">Outside boundary</div>
        </div>,
      );

      // Component outside boundary should still render
      expect(screen.getByTestId('outside')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('SectionErrorBoundary', () => {
    it('renders section children when no error occurs', () => {
      render(
        <SectionErrorBoundary sectionId="hero">
          <WorkingComponent />
        </SectionErrorBoundary>,
      );

      expect(screen.getByTestId('working')).toBeInTheDocument();
    });

    it('catches section errors and renders null', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SectionErrorBoundary sectionId="hero">
          <ErrorComponent />
        </SectionErrorBoundary>,
      );

      expect(screen.queryByTestId('working')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('logs error with section ID', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SectionErrorBoundary sectionId="hero-section">
          <ErrorComponent />
        </SectionErrorBoundary>,
      );

      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          component: 'hero-section',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('uses default component name when sectionId is not provided', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SectionErrorBoundary>
          <ErrorComponent />
        </SectionErrorBoundary>,
      );

      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          component: 'Section',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('allows multiple sections with independent error boundaries', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <div>
          <SectionErrorBoundary sectionId="section1">
            <ErrorComponent />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionId="section2">
            <div data-testid="section2">Section 2</div>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionId="section3">
            <div data-testid="section3">Section 3</div>
          </SectionErrorBoundary>
        </div>,
      );

      // Section 1 should not render (error)
      expect(screen.queryByTestId('section1')).not.toBeInTheDocument();
      // Sections 2 and 3 should still render
      expect(screen.getByTestId('section2')).toBeInTheDocument();
      expect(screen.getByTestId('section3')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('BlockErrorBoundary', () => {
    it('renders block children when no error occurs', () => {
      render(
        <BlockErrorBoundary blockId="text-block">
          <WorkingComponent />
        </BlockErrorBoundary>,
      );

      expect(screen.getByTestId('working')).toBeInTheDocument();
    });

    it('catches block errors and renders null', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <BlockErrorBoundary blockId="text-block">
          <ErrorComponent />
        </BlockErrorBoundary>,
      );

      expect(screen.queryByTestId('working')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('logs error with block ID', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <BlockErrorBoundary blockId="image-block">
          <ErrorComponent />
        </BlockErrorBoundary>,
      );

      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          component: 'image-block',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('uses default component name when blockId is not provided', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <BlockErrorBoundary>
          <ErrorComponent />
        </BlockErrorBoundary>,
      );

      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          component: 'Block',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('allows multiple blocks with independent error boundaries', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <div>
          <BlockErrorBoundary blockId="block1">
            <div data-testid="block1">Block 1</div>
          </BlockErrorBoundary>
          <BlockErrorBoundary blockId="block2">
            <ErrorComponent />
          </BlockErrorBoundary>
          <BlockErrorBoundary blockId="block3">
            <div data-testid="block3">Block 3</div>
          </BlockErrorBoundary>
        </div>,
      );

      // Blocks 1 and 3 should render
      expect(screen.getByTestId('block1')).toBeInTheDocument();
      expect(screen.getByTestId('block3')).toBeInTheDocument();
      // Block 2 should not render (error)
      expect(screen.queryByTestId('block2')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('handles nested section and block error boundaries', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SectionErrorBoundary sectionId="parent-section">
          <div data-testid="section-content">
            <BlockErrorBoundary blockId="child-block">
              <ErrorComponent />
            </BlockErrorBoundary>
            <div data-testid="section-other">Other content</div>
          </div>
        </SectionErrorBoundary>,
      );

      // Section should still render
      expect(screen.getByTestId('section-content')).toBeInTheDocument();
      expect(screen.getByTestId('section-other')).toBeInTheDocument();
      // Block with error should not render
      expect(screen.queryByTestId('child-block')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('catches error at nearest boundary', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SectionErrorBoundary sectionId="outer">
          <BlockErrorBoundary blockId="inner">
            <ErrorComponent />
          </BlockErrorBoundary>
        </SectionErrorBoundary>,
      );

      // Error should be caught by BlockErrorBoundary (inner), not SectionErrorBoundary
      expect(mockLogError).toHaveBeenCalledWith(
        'Component render error',
        expect.objectContaining({
          component: 'inner',
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
