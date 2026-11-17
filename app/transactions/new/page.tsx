import type { Metadata } from "next";
import { NewTransactionScreen } from "@/components/transaction/NewTransactionScreen";

export const metadata: Metadata = {
  title: "Add transaction",
};

export default function Page() {
  return <NewTransactionScreen />;
}
