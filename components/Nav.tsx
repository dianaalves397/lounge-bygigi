import { getCategories } from "@/lib/db";
import NavClient from "@/components/NavClient";

function sortCategories(categories: any[]) {
  return [...categories].sort((a, b) => {
    const orderA = Number(a.sortOrder || 999);
    const orderB = Number(b.sortOrder || 999);

    if (orderA !== orderB) return orderA - orderB;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function filterByGender(categories: any[], gender: "men" | "women") {
  return sortCategories(categories).filter((category) => {
    const id = String(category.id || "").toLowerCase();
    const name = String(category.name || "").toLowerCase();
    const categoryGender = String(category.gender || "unisex").toLowerCase();

    if (id === "printful" || id === "printify" || name === "printful" || name === "printify") {
      return false;
    }

    return categoryGender === gender || categoryGender === "unisex";
  });
}

export default async function Nav() {
  const categories = await getCategories();

  return (
    <NavClient
      womenCategories={filterByGender(categories, "women")}
      menCategories={filterByGender(categories, "men")}
    />
  );
}

