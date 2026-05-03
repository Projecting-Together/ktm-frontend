"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { CompareColumns } from "@/components/compare/CompareColumns";
import { useCompareStore } from "@/lib/stores/compareStore";
import { cn } from "@/lib/utils";

export function CompareDrawer() {
  const entries = useCompareStore((s) => s.entries);
  const drawerOpen = useCompareStore((s) => s.drawerOpen);
  const setDrawerOpen = useCompareStore((s) => s.setDrawerOpen);
  const remove = useCompareStore((s) => s.remove);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (!drawerOpen) setWide(false);
  }, [drawerOpen]);

  return (
    <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 right-0 top-0 z-[100] flex flex-col bg-background outline-none transition-[width] duration-200",
            wide
              ? "w-[min(100vw-1rem,52rem)] md:w-[min(100vw-2rem,min(90vw,72rem))]"
              : "w-[min(100vw-1rem,28rem)] md:w-[min(100vw-2rem,36rem)]",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <Drawer.Title className="text-lg font-semibold">Compare listings</Drawer.Title>
              <Drawer.Description className="sr-only">
                Side-by-side summary of listings you selected. Up to five properties.
              </Drawer.Description>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {entries.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setWide((w) => !w)}
                  className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
                >
                  {wide ? "Compact" : "Wide view"}
                </button>
              ) : null}
              <Drawer.Close className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted">
                Close
              </Drawer.Close>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No listings selected. Add some from search or a property page.</p>
            ) : (
              <CompareColumns entries={entries} onRemove={remove} compact={!wide} />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
