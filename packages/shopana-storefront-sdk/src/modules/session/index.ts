/**
 * Session Module
 *
 * Complete session management module with state, hooks, and providers
 */

// Core types
export * from './core/types';
export * from './core/IamApplicationClient';
export * from './core/StorefrontSessionClient';
export * from './core/sessionCookies';

// Store
export * from './store/SessionStore';
export { createSessionStore } from './store/createSessionStore';

// React
export * from './react';

// Server-only parts live in './next' (loaders) and './server' (session handlers).
