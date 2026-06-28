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

const BAD_IDS = ["printful", "printify"];

function cleanCategories(categories) {
  return (categories || []).filter((category) => {
    const id = String(category.id || "").toLowerCase();
    const name = String(category.name || "").toLowerCase();
    return !BAD_IDS.includes(id) && !BAD_IDS.includes(name);
  });
}

function cleanProducts(products) {
  return (products || []).map((product) => {
    const cleanCategoryIds = Array.isArray(product.categoryIds)
      ? product.categoryIds.filter((id) => !BAD_IDS.includes(String(id).toLowerCase()))
      : [];

    const categoryId = BAD_IDS.includes(String(product.categoryId || "").toLowerCase())
      ? cleanCategoryIds[0] || ""
      : product.categoryId;

    const category = BAD_IDS.includes(String(product.category || "").toLowerCase())
      ? ""
      : product.category;

    return {
      ...product,
      categoryId,
      category,
      categoryIds: cleanCategoryIds
    };
  });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

async function updateSupabase(table) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("Sem Supabase env. A limpar so ficheiros locais.");
    return;
  }

  async function getRow(rowKey) {
    const res = await fetch(`${url}/rest/v1/${table}?key=eq.${rowKey}&select=key,data`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!res.ok) throw new Error(await res.text());

    const rows = await res.json();
    return rows[0];
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

    if (!res.ok) throw new Error(await res.text());
  }

  const categoriesRow = await getRow("categories");
  if (categoriesRow?.data) {
    const before = categoriesRow.data.length;
    const next = cleanCategories(categoriesRow.data);
    await patchRow("categories", next);
    console.log(`${table}: categorias ${before} -> ${next.length}`);
  }

  const productsRow = await getRow("products");
  if (productsRow?.data) {
    const next = cleanProducts(productsRow.data);
    await patchRow("products", next);
    console.log(`${table}: produtos limpos`);
  }
}

async function main() {
  writeJson("data/categories.json", cleanCategories(readJson("data/categories.json", [])));
  writeJson("data/products.json", cleanProducts(readJson("data/products.json", [])));

  for (const table of ["lounge_store", "louge_store"]) {
    try {
      await updateSupabase(table);
    } catch (error) {
      console.log(`${table}: ignorado - ${error.message}`);
    }
  }

  console.log("printful/printify removidos das categorias.");
}

main();
