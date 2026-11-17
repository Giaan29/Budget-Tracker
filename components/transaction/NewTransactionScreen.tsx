"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/transaction/TransactionForm";
import { Sheet } from "@/components/ui/Sheet";
import { ScreenSkeleton } from "@/components/ui/Skeleton";
import { useStore } from "@/lib/store";

export function NewTransactionScreen() {
  const store = useStore();
  const router = useRouter();

  if (!store) return <ScreenSkeleton title="Add transaction" />;

  function close() {
    router.push("/transactions");
  }

  return (
    <Sheet title="Add transaction" onClose={close}>
      <TransactionForm onDone={close} />
    </Sheet>
  );
}
