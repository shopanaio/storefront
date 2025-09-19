"use client";

import React, { createContext, useContext } from "react";
import { SerializablePreloadedQuery } from "@src/relay/loadSerializableQuery";
import { ConcreteRequest, OperationType } from "relay-runtime";

type QueryContextType<T extends OperationType = OperationType> = {
  preloadedQuery: SerializablePreloadedQuery<ConcreteRequest, T>;
} | null;

const QueryContext = createContext<QueryContextType>(null);

interface QueryProviderProps<T extends OperationType = OperationType> {
  children: React.ReactNode;
  preloadedQuery: SerializablePreloadedQuery<ConcreteRequest, T>;
}

export function QueryProvider<T extends OperationType = OperationType>({
  children,
  preloadedQuery,
}: QueryProviderProps<T>) {
  return (
    <QueryContext.Provider value={{ preloadedQuery }}>
      {children}
    </QueryContext.Provider>
  );
}

export function useQuery<T extends OperationType = OperationType>() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }
  return context.preloadedQuery as SerializablePreloadedQuery<
    ConcreteRequest,
    T
  >;
}
