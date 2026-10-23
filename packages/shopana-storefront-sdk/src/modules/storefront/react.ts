'use client';
import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { createStorefrontApi } from './index';

export function useStorefrontApi() {
  const client = useApolloClient();
  return useMemo(() => createStorefrontApi(client), [client]);
}
