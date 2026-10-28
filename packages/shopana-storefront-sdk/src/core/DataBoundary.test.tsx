import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataBoundary, DataGate } from './DataBoundary';

const Section = () => <p>products</p>;

const Suspends = () => {
  throw new Promise(() => {});
};

describe('DataBoundary', () => {
  it('renders its children without a gate', () => {
    render(
      <DataBoundary fallback={<p>skeleton</p>}>
        <Section />
      </DataBoundary>
    );

    expect(screen.getByText('products')).toBeInTheDocument();
  });

  it('holds its children back on the fallback while the gate is closed', () => {
    const { rerender } = render(
      <DataGate open={false}>
        <DataBoundary fallback={<p>skeleton</p>}>
          <Section />
        </DataBoundary>
      </DataGate>
    );

    expect(screen.getByText('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('products')).not.toBeInTheDocument();

    rerender(
      <DataGate open>
        <DataBoundary fallback={<p>skeleton</p>}>
          <Section />
        </DataBoundary>
      </DataGate>
    );

    expect(screen.getByText('products')).toBeInTheDocument();
  });

  it('shows the fallback while its children suspend', () => {
    render(
      <DataBoundary fallback={<p>skeleton</p>}>
        <Suspends />
      </DataBoundary>
    );

    expect(screen.getByText('skeleton')).toBeInTheDocument();
  });
});
