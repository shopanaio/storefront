'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { logError } from '../utils/logger';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
}

class BaseErrorBoundary extends Component<
  BaseErrorBoundaryProps,
  BaseErrorBoundaryState
> {
  public state: BaseErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): BaseErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: BaseErrorBoundaryProps) {
    // Reset error state when children change (e.g., client-side navigation)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError('Component render error', {
      error,
      component: this.props.componentName,
      boundary: 'global',
      extra: { info },
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionId?: string;
}

export function SectionErrorBoundary({
  children,
  sectionId,
}: SectionErrorBoundaryProps) {
  return (
    <BaseErrorBoundary componentName={sectionId ?? 'Section'}>
      {children}
    </BaseErrorBoundary>
  );
}

export interface BlockErrorBoundaryProps {
  children: ReactNode;
  blockId?: string;
}

export function BlockErrorBoundary({
  children,
  blockId,
}: BlockErrorBoundaryProps) {
  return (
    <BaseErrorBoundary componentName={blockId ?? 'Block'}>
      {children}
    </BaseErrorBoundary>
  );
}

export { BaseErrorBoundary as ErrorBoundary };

