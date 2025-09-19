"use client";

import { GreetingData } from "../interface";
import { graphql } from "relay-runtime";

// Test (stub) query for Relay integration and schema validation
export const ProviderGreetingTestQuery = graphql`
  query useGreetingTestQuery {
    product(id: "example") {
      id
    }
  }
`;

const useGreeting = (): GreetingData => {
  // Mock data for Shopify provider
  return {
    title: "Hello from Shopify 🛍️",
  };
};

export default useGreeting;
