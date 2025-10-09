'use client';

import { Flex } from "antd";
import { useLogo } from "@src/hooks/useLogo";

export const CheckoutBrand = () => {
  const Logo = useLogo();

  return (
    <>
      <Flex className="container" justify="center">
        <Logo theme="light" size={32} />
      </Flex>
    </>
  );
};
