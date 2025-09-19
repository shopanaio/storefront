import { ApiMenuNode } from "@codegen/schema-client";

export const useMenuHref = (locale: string) => {
  return (node: ApiMenuNode): string => {
    if (!node || typeof node !== "object") return "#";

    switch ((node as ApiMenuNode).__typename) {
      case "Category":
        return `/${locale}/category/${node.handle}`;
      case "Product":
        return `/${locale}/product/${node.handle}`;
      case "Page":
        return `/${locale}/page/${node.handle}`;
      case "URLNode":
        return node.url || "#";
      default:
        return "#";
    }
  };
};
