import { ApiMenu } from "@codegen/schema-client";
import { mockProductMenu } from "./FooterMenus/menuProduct";
import { mockPageMenu } from "./FooterMenus/menuPage";
import { mockCategoryMenu } from "./FooterMenus/menuCategory";
import { mockAdditionalMenu } from "./FooterMenus/menuAdditionalInfo";

export const footerMenusArr: ApiMenu[] = [
  mockAdditionalMenu,
  mockPageMenu,
  mockCategoryMenu,
  mockProductMenu,
  mockPageMenu,
  mockCategoryMenu,
  mockProductMenu,
]
