"use client";

import React from "react";
import { Home } from "@src/components/Home/Home";
import useHomeClientQuery from "@src/hooks/home/useHomeClientQuery";

export const HomeClient = () => {
  const sections = useHomeClientQuery();

  return <Home sections={sections} />;
};
