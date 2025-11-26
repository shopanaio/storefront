"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMobileConfirmStore } from "./mobileConfirmStore";
import MobileConfirmDrawer from "./MobileConfirmDrawer";

/**
 * Hosts the MobileConfirmDrawer in a React portal under existing app providers.
 */
export const ConfirmPortalHost = () => {
  const open = useMobileConfirmStore((s) => s.open);
  const options = useMobileConfirmStore((s) => s.options);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!open && !options)) return null;
  return createPortal(<MobileConfirmDrawer />, document.body);
};

export default ConfirmPortalHost;
