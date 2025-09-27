import { ApiMenu } from "@codegen/schema-client";
import { mockProductMenu } from "./FooterMenus/menuProduct";
import { mockPageMenu } from "./FooterMenus/menuPage";
import { mockCategoryMenu } from "./FooterMenus/menuCategory";

export const footerMenusArr: ApiMenu[] = [
  mockPageMenu,
  mockCategoryMenu,
  mockProductMenu,
];
