import { UAClientContext } from "@src/providers/responsive-client-provider";
import { useContext } from "react";

export const useUA = () => {
  return useContext(UAClientContext);
};
