'use client';

import { Component, type ReactNode } from 'react';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[SectionErrorBoundary]', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Section failed to render.</div>;
    }

    return this.props.children;
  }
}
