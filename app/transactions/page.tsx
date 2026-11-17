import type { Metadata } from "next";
import { TransactionsScreen } from "@/components/transactions/TransactionsScreen";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function Page() {
  return <TransactionsScreen />;
}
