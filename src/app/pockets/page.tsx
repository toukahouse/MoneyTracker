import { getPockets } from "@/lib/actions/pockets";
import { getBudgets } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import { PocketsClient } from "./client-pockets";

export const dynamic = "force-dynamic";

export default async function PocketsPage() {
  const pockets = await getPockets();
  const budgets = await getBudgets();
  const allCategories = await getCategories();
  const expenseCategories = allCategories.filter((c) => c.type === "EXPENSE");

  return (
    <PocketsClient
      initialPockets={pockets as any}
      initialBudgets={budgets as any}
      categories={expenseCategories}
    />
  );
}
