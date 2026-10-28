'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { logError } from '../utils/logger';
import { isPageLevelError } from './PageNotFoundError';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  /** A page-level error (see `isPageLevelError`), rethrown to the boundaries above. */
  pageError: unknown;
}

class BaseErrorBoundary extends Component<
  BaseErrorBoundaryProps,
  BaseErrorBoundaryState
> {
  public state: BaseErrorBoundaryState = {
    hasError: false,
    pageError: null,
  };

  static getDerivedStateFromError(error: unknown): BaseErrorBoundaryState {
    return { hasError: true, pageError: isPageLevelError(error) ? error : null };
  }

  componentDidUpdate(prevProps: BaseErrorBoundaryProps) {
    // Reset error state when children change (e.g., client-side navigation)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, pageError: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isPageLevelError(error)) return;
    logError('Component render error', {
      error,
      component: this.props.componentName,
      boundary: 'global',
      extra: { info },
    });
  }

  render() {
    if (this.state.pageError) throw this.state.pageError;
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
