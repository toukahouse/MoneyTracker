import { getWishlists } from "@/lib/actions/wishlists";
import { getPockets } from "@/lib/actions/pockets";
import { WishlistsClient } from "./client-wishlists";

export const dynamic = "force-dynamic";

export default async function WishlistsPage() {
  const wishlists = await getWishlists();
  const pockets = await getPockets();

  return (
    <WishlistsClient
      initialWishlists={wishlists as any}
      pockets={pockets}
    />
  );
}
