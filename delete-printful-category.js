const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

/* 1. API principal de categorias: se vier originalId, atualiza essa categoria em vez de criar nova */
const route = "app/api/categories/route.ts";

if (fs.existsSync(route)) {
  let c = read(route);

  c = `import { getCategories, saveCategories } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
 
cd C:\Users\AESGAMA\Downloads\lounge-by-gigi-pod-supabase

@'
const fs = require("fs");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#") || !clean.includes("=")) continue;

    const [key, ...rest] = clean.split("=");
    const value = rest.join("=").replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

const CATEGORY_ID = "printful";

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function cleanCategories(categories) {
  return categories.filter((category) => String(category.id).toLowerCase() !== CATEGORY_ID);
}

function cleanProducts(products) {
  return products.map((product) => {
    const categoryIds = Array.isArray(product.categoryIds)
      ? product.categoryIds.filter((id) => String(id).toLowerCase() !== CATEGORY_ID)
      : [];

    return {
      ...product,
      categoryId: String(product.categoryId).toLowerCase() === CATEGORY_ID ? (categoryIds[0] || "") : product.categoryId,
      categoryIds,
      category: String(product.category).toLowerCase() === CATEGORY_ID || String(product.category).toLowerCase() === "printful" ? "" : product.category
    };
  });
}

async function updateSupabaseTable(table) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("Supabase env em falta. Só foram alterados ficheiros locais.");
    return;
  }

  async function getRow(rowKey) {
    const res = await fetch(`${url}/rest/v1/${table}?key=eq.${rowKey}&select=key,data`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!res.ok) throw new Error(`${table}/${rowKey}: ${await res.text()}`);

    const rows = await res.json();
    return rows[0] || null;
  }

  async function patchRow(rowKey, data) {
    const res = await fetch(`${url}/rest/v1/${table}?key=eq.${rowKey}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        data,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) throw new Error(`${table}/${rowKey} PATCH: ${await res.text()}`);
  }

  const categoriesRow = await getRow("categories");
  if (categoriesRow && Array.isArray(categoriesRow.data)) {
    const before = categoriesRow.data.length;
    const next = cleanCategories(categoriesRow.data);
    await patchRow("categories", next);
    console.log(`${table}: categories ${before} -> ${next.length}`);
  }

  const productsRow = await getRow("products");
  if (productsRow && Array.isArray(productsRow.data)) {
    const next = cleanProducts(productsRow.data);
    await patchRow("products", next);
    console.log(`${table}: products limpos da categoria printful`);
  }
}

async function main() {
  const localCategories = readJson("data/categories.json", []);
  const localProducts = readJson("data/products.json", []);

  writeJson("data/categories.json", cleanCategories(localCategories));
  writeJson("data/products.json", cleanProducts(localProducts));

  console.log(`Local: categories ${localCategories.length} -> ${cleanCategories(localCategories).length}`);

  for (const table of ["lounge_store", "louge_store"]) {
    try {
      await updateSupabaseTable(table);
    } catch (error) {
      console.log(`${table}: ignorado (${error.message})`);
    }
  }

  console.log("Categoria printful removida.");
}

main();
