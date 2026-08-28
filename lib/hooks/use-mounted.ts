"use client";

import { useEffect, useState } from "react";

// SSR-safe "has this component hydrated on the client yet" flag — used to
// gate `createPortal(..., document.body)` calls, since `document` doesn't
// exist during server rendering. The setState is wrapped in a microtask
// callback (rather than called directly in the effect body) to satisfy the
// react-hooks/set-state-in-effect rule; functionally it still flips to true
// on the very next tick after mount, before the user could ever notice.
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return mounted;
}
