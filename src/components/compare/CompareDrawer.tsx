"use client";

import Link from "next/link";
import { Drawer } from "vaul";
import { CompareColumns } from "@/components/compare/CompareColumns";
import { useCompareStore } from "@/lib/stores/compareStore";

export function CompareDrawer() {
  const entries = useCompareStore((s) => s.entries);
  const drawerOpen = useCompareStore((s) => s.drawerOpen);
  const setDrawerOpen = useCompareStore((s) => s.setDrawerOpen);
  const remove = useCompareStore((s) => s.remove);

  return (
    <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Drawer.Content
          className="fixed bottom-0 right-0 top-0 z-[100] flex w-[min(100vw-1rem,28rem)] flex-col bg-background outline-none md:w-[min(100vw-2rem,36rem)]"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <Drawer.Title className="text-lg font-semibold">Compare listings</Drawer.Title>
              <Drawer.Description className="sr-only">
                Side-by-side summary of listings you selected. Up to five properties.
              </Drawer.Description>
            </div>
            <Drawer.Close className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted">
              Close
            </Drawer.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No listings selected. Add some from search or a property page.</p>
            ) : (
              <>
                <CompareColumns entries={entries} onRemove={remove} compact />
                <Link
                  href="/compare"
                  className="btn-primary mt-6 inline-flex w-full justify-center text-sm"
                  onClick={() => setDrawerOpen(false)}
                >
                  Open full compare page
                </Link>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
