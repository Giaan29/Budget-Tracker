"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type SheetProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ title, description, onClose, children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="sheet"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="sheet-panel">
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4 lg:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-[-0.01em]"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6 lg:px-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}
