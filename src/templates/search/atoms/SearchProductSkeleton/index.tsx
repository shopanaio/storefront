import { Flex, Skeleton } from "antd";

import useToken from "antd/es/theme/useToken";

export const SearchProductSkeleton = () => {
  const [, token] = useToken();

  return (
    <Flex align="center" justify="flex-start" gap={token.paddingSM}>
      <Skeleton.Avatar active size={48} shape="square" />
      <Flex vertical gap={token.paddingXXS}>
        <Skeleton.Button
          active
          style={{ width: 260, height: 16 }}
          shape="round"
        />
        <Skeleton.Button
          active
          style={{ width: 80, height: 16 }}
          shape="round"
        />
      </Flex>
    </Flex>
  );
};
