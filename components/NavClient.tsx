"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "@/components/CartButton";

type Category = {
  id: string;
  name: string;
  gender?: string;
  sortOrder?: number;
};

export default function NavClient({
  womenCategories,
  menCategories
}: {
  womenCategories: Category[];
  menCategories: Category[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="old-nav">
      <Link className="old-nav-logo" href="/">
        lounge
      </Link>

      <nav className="old-nav-center">
        {!isHome ? <Link href="/">Página inicial</Link> : null}

        <details className="old-nav-dropdown">
          <summary>Men</summary>
          <div className="old-nav-dropdown-menu">
            <Link href="/shop?gender=men">Ver categorias Men</Link>
            {menCategories.map((category) => (
              <Link key={category.id} href={`/shop?gender=men&category=${category.id}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </details>

        <details className="old-nav-dropdown">
          <summary>Women</summary>
          <div className="old-nav-dropdown-menu">
            <Link href="/shop?gender=women">Ver categorias Women</Link>
            {womenCategories.map((category) => (
              <Link key={category.id} href={`/shop?gender=women&category=${category.id}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </details>
      </nav>

      <div className="old-nav-right">
        <select className="old-nav-select" defaultValue="PT-EUR">
          <option value="PT-EUR">PT · EUR</option>
        </select>

        <Link className="old-nav-account" href="/account">
          Conta
        </Link>

        <CartButton />
      </div>
    </header>
  );
}
