import type { Metadata } from "next";
import { BudgetsScreen } from "@/components/budgets/BudgetsScreen";

export const metadata: Metadata = {
  title: "Budgets",
};

export default function Page() {
  return <BudgetsScreen />;
}
