"use client";

import { useContext } from "react";
import { UAClientContext } from "./ResponsiveClientProvider";

export const useUA = () => {
  return useContext(UAClientContext);
};
