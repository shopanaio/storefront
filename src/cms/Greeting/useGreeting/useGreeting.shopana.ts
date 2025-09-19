"use client";

import { GreetingData } from "../interface";
import { graphql } from "relay-runtime";

// Test (stub) query for Relay integration and schema validation
export const ProviderGreetingTestQuery = graphql`
  query useGreetingTestQuery {
    product(handle: "example") {
      id
    }
  }
`;

const useGreeting = (): GreetingData => {
  // Mock data for Shopana provider
  return {
    title: "Hello from Shopana 🎁",
  };
};

export default useGreeting;
