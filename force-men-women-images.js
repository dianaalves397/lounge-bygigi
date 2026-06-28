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

const MEN_IMAGE = "https://i.pinimg.com/1200x/e7/d9/fa/e7d9fa6fd8378282a2b56e5b63c4266c.jpg";
const WOMEN_IMAGE = "https://i.pinimg.com/1200x/60/93/c7/6093c7089d8a61945a385ee00ee2ab07.jpg";

function applyImages(settings) {
  settings.shopPages = settings.shopPages || {};
  settings.shopPages.men = settings.shopPages.men || {};
  settings.shopPages.women = settings.shopPages.women || {};

  settings.shopPages.men.heroMediaUrl = MEN_IMAGE;
  settings.shopPages.men.heroMediaType = "image";

  settings.shopPages.women.heroMediaUrl = WOMEN_IMAGE;
  settings.shopPages.women.heroMediaType = "image";

  return settings;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

async function updateSupabaseSettings(table) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("Sem variáveis Supabase. Só atualizei o ficheiro local.");
    return;
  }

  const getRes = await fetch(`${url}/rest/v1/${table}?key=eq.settings&select=key,data`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!getRes.ok) {
    throw new Error(`${table}: ${await getRes.text()}`);
  }

  const rows = await getRes.json();
  const current = rows[0]?.data || {};
  const next = applyImages(current);

  const patchRes = await fetch(`${url}/rest/v1/${table}?key=eq.settings`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      data: next,
      updated_at: new Date().toISOString()
    })
  });

  if (!patchRes.ok) {
    throw new Error(`${table} PATCH: ${await patchRes.text()}`);
  }

  console.log(`${table}: imagens Men/Women atualizadas.`);
}

async function main() {
  const settingsPath = "data/settings.json";
  const localSettings = applyImages(readJson(settingsPath, {}));
  writeJson(settingsPath, localSettings);

  for (const table of ["lounge_store", "louge_store"]) {
    try {
      await updateSupabaseSettings(table);
    } catch (error) {
      console.log(`${table}: ignorado - ${error.message}`);
    }
  }

  console.log("Concluído.");
}

main();
