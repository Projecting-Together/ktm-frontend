"use client";

type ProUpgradeModalProps = {
  open: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ProUpgradeModal({ open, isLoading = false, onConfirm, onCancel }: ProUpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 id="pro-upgrade-title" className="text-lg font-semibold">
          Upgrade to Pro
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You have reached your free listing limit. Upgrade to Pro to continue creating listings.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary px-4" disabled={isLoading}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary px-4" disabled={isLoading}>
            {isLoading ? "Upgrading..." : "Upgrade and Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
