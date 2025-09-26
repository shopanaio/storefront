"use client";

import React from "react";
import { Button } from "antd";
import { TbMenu2 } from "react-icons/tb";
import { useModalStore } from "@src/store/appStore";

type AppDrawerButtonProps = {
  size?: number;
  className?: string;
};

export const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({ size = 24, className }) => {
  const setIsAppDrawerOpen = useModalStore((s) => s.setIsAppDrawerOpen);
  return (
    <Button
      className={className}
      type="text"
      icon={<TbMenu2 size={size} />}
      onClick={() => setIsAppDrawerOpen(true)}
    />
  );
};
