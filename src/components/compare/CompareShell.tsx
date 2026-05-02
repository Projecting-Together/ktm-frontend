"use client";

import { CompareDrawer } from "@/components/compare/CompareDrawer";
import { CompareFloatingButton } from "@/components/compare/CompareFloatingButton";

/** Global compare UI: slide-in drawer + floating entry when at least one listing is selected. */
export function CompareShell() {
  return (
    <>
      <CompareFloatingButton />
      <CompareDrawer />
    </>
  );
}
