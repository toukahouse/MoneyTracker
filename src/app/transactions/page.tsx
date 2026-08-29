import { getTransactions } from "@/lib/actions/transactions";
import { getPockets } from "@/lib/actions/pockets";
import { getCategories } from "@/lib/actions/categories";
import { TransactionsClient } from "./client-transactions";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const pockets = await getPockets();
  const categories = await getCategories();

  return (
    <TransactionsClient
      initialTransactions={transactions as any}
      pockets={pockets}
      categories={categories}
    />
  );
}
