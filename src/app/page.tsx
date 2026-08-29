import { getDashboardData } from "@/lib/actions/dashboard";
import { getPockets } from "@/lib/actions/pockets";
import { getCategories } from "@/lib/actions/categories";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const pockets = await getPockets();
  const categories = await getCategories();

  return (
    <DashboardClient
      initialData={dashboardData as any}
      pockets={pockets}
      categories={categories}
    />
  );
}
