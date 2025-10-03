'use client';

import React, { createContext, useContext } from 'react';

export interface ProviderControllerApi {
  publishValid: (data: unknown) => void;
  publishInvalid: (errors?: Record<string, string>) => void;
  reset: () => void;
}

const ProviderControllerContext = createContext<ProviderControllerApi | null>(null);

export function ProviderControllerProvider({
  value,
  children,
}: {
  value: ProviderControllerApi;
  children: React.ReactNode;
}) {
  return (
    <ProviderControllerContext.Provider value={value}>
      {children}
    </ProviderControllerContext.Provider>
  );
}

export function useProviderControllerApi(): ProviderControllerApi {
  const ctx = useContext(ProviderControllerContext);
  if (!ctx) {
    throw new Error('useProviderControllerApi must be used within ProviderControllerProvider');
  }
  return ctx;
}
