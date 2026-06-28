const fs = require("fs");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#") || !clean.includes("=")) continue;

    const [key, ...rest] = clean.split("=");
    const value = rest.join("=").replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

const BAD = ["printful", "printify"];

function isBad(value) {
  return BAD.includes(String(value || "").trim().toLowerCase());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function cleanCategories(categories) {
  return (categories || []).filter((category) => {
    return !isBad(category.id) && !isBad(category.name);
  });
}

function cleanProducts(products) {
  return (products || []).map((product) => {
    const categoryIds = Array.isArray(product.categoryIds)
      ? product.categoryIds.filter((id) => !isBad(id))
      : [];

    let categoryId = product.categoryId;
    let category = product.category;

    if (isBad(categoryId)) categoryId = categoryIds[0] || "";
    if (isBad(category)) category = "";

    return {
      ...product,
      categoryId,
      category,
      categoryIds
    };
  });
}

async function updateTable(table) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("Sem variáveis Supabase. Limpeza feita apenas localmente.");
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
    console.log(`${table}: categories ${before} -> ${next.length}`);
  }

  const productsRow = await getRow("products");
  if (productsRow?.data) {
    const next = cleanProducts(productsRow.data);
    await patchRow("products", next);
    console.log(`${table}: products limpos`);
  }
}

async function main() {
  writeJson("data/categories.json", cleanCategories(readJson("data/categories.json", [])));
  writeJson("data/products.json", cleanProducts(readJson("data/products.json", [])));

  for (const table of ["lounge_store", "louge_store"]) {
    try {
      await updateTable(table);
    } catch (error) {
      console.log(`${table}: ignorado - ${error.message}`);
    }
  }

  console.log("Categorias printful/printify removidas.");
}

main();
