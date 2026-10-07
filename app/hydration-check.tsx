"use client";

import { useEffect, useState } from "react";

// Renders "static" in the exported HTML and flips to "hydrated" once client JS runs,
// so a basePath/chunk-loading failure is visible on the live page.
export function HydrationCheck() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return <p data-testid="hydration">Client JS: {hydrated ? "hydrated" : "static"}</p>;
}
