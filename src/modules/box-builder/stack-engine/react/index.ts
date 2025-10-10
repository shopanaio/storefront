import React from 'react';

/**
 * @public
 * Activity component type facade. Matches usage in codebase: a component that
 * receives a single `params` prop.
 */
export type ActivityComponentType<P = unknown> = React.ComponentType<{ params: P }>;
