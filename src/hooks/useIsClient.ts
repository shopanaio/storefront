import React, { useEffect, useState } from "react";

// TODO: Make a global state for isSSR
let isServer = true;

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(!isServer);

  useEffect(() => {
    isServer = false;
    setIsClient(!isServer);
  }, []);

  return isClient;
};
