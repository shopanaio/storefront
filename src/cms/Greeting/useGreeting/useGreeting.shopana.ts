'use client';

import { StorefrontUseGreetingTestQueryDocument } from '../../../../codegen/apollo/storefront-operations';

import { GreetingData } from '../interface';

// Test (stub) query for GraphQL integration and schema validation
export const ProviderGreetingTestQuery = StorefrontUseGreetingTestQueryDocument;

const useGreeting = (): GreetingData => {
  // Mock data for Shopana provider
  return {
    title: 'Hello from Shopana 🎁',
  };
};

export default useGreeting;
