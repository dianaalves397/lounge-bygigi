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

const BAD = ["printful", "printify"];

function isBad(value) {
  return BAD.includes(String(value || "").trim().toLowerCase());
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

    return {
      ...product,
      categoryId: isBad(product.categoryId) ? "" : product.categoryId,
      category: isBad(product.category) ? "" : product.category,
      collection: isBad(product.collection) ? "" : product.collection,
      categoryIds
    };
  });
}

async function patchSupabaseRow(table, rowKey, nextData) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${url}/rest/v1/${table}?key=eq.${rowKey}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      data: nextData,
      updated_at: new Date().toISOString()
    })
  });

  if (!res.ok) {
    throw new Error(`${table}/${rowKey}: ${await res.text()}`);
  }
}

async function getSupabaseRow(table, rowKey) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${url}/rest/v1/${table}?key=eq.${rowKey}&select=key,data`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!res.ok) {
    throw new Error(`${table}/${rowKey}: ${await res.text()}`);
  }

  const rows = await res.json();
  return rows[0] || null;
}

async function cleanSupabaseTable(table) {
  const categoriesRow = await getSupabaseRow(table, "categories");
  if (categoriesRow?.data) {
    const before = categoriesRow.data.length;
    const next = cleanCategories(categoriesRow.data);
    await patchSupabaseRow(table, "categories", next);
    console.log(`${table}: categories ${before} -> ${next.length}`);
  }

  const productsRow = await getSupabaseRow(table, "products");
  if (productsRow?.data) {
    const next = cleanProducts(productsRow.data);
    await patchSupabaseRow(table, "products", next);
    console.log(`${table}: products limpos`);
  }
}

async function main() {
  const localCategories = readJson("data/categories.json", []);
  const localProducts = readJson("data/products.json", []);

  writeJson("data/categories.json", cleanCategories(localCategories));
  writeJson("data/products.json", cleanProducts(localProducts));

  console.log(`Local categories: ${localCategories.length} -> ${cleanCategories(localCategories).length}`);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Variáveis Supabase em falta. Só limpei ficheiros locais.");
    return;
  }

  for (const table of ["lounge_store", "louge_store"]) {
    try {
      await cleanSupabaseTable(table);
    } catch (error) {
      console.log(`${table}: ignorado (${error.message})`);
    }
  }

  console.log("Limpeza concluída.");
}

main();
