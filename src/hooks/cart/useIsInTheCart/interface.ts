import { ApiProduct } from "@codegen/schema-client";

// Universal interface for checking if item is in cart
export interface UseIsInCartProps {
  product: ApiProduct; // Pass the entire product object instead of separate IDs
}
