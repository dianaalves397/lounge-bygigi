// @ts-nocheck

import Nav from "@/components/Nav";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ShopPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;

  return (
    <>
      <Nav />
      <ShopClient
        initialGender={String(params?.gender || "all")}
        initialCategory={String(params?.category || "")}
        initialQuery={String(params?.q || params?.search || "")}
      />
    </>
  );
}
