import { ApiMenuNode } from "@codegen/schema-client";
import { useRoutes } from "@src/hooks/useRoutes";

export const useMenuHref = () => {
  const routes = useRoutes();

  return (node: ApiMenuNode): string => {
    if (!node || typeof node !== "object") return "#";

    switch ((node as ApiMenuNode).__typename) {
      case "Category":
        return routes.collection.path(node.handle);
      case "Product":
        return routes.product.path(node.handle);
      case "Page":
        return routes.page.path(node.handle);
      case "URLNode":
        return node.url || "#";
      default:
        return "#";
    }
  };
};
