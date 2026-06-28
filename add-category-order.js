const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

/* 1. Atualizar types.ts para categorias terem sortOrder */
if (fs.existsSync("types.ts")) {
  let c = read("types.ts");

  if (!c.includes("sortOrder?: number")) {
    c = c.replace(
      /featured:\s*boolean;/,
      "featured: boolean;\n  sortOrder?: number;"
    );
  }

  write("types.ts", c);
}

/* 2. Migrar categorias locais com sortOrder */
if (fs.existsSync("data/categories.json")) {
  const categories = JSON.parse(read("data/categories.json"));

  const next = categories.map((category, index) => ({
    ...category,
    sortOrder:
      typeof category.sortOrder === "number"
        ? category.sortOrder
        : index + 1
  }));

  write("data/categories.json", JSON.stringify(next, null, 2));
}

/* 3. Ordenar categorias na página inicial */
if (fs.existsSync("app/page.tsx")) {
  let c = read("app/page.tsx");

  if (!c.includes("sortCategoriesByOrder")) {
    c = c.replace(
      /export const dynamic = "force-dynamic";/,
      `export const dynamic = "force-dynamic";

function sortCategoriesByOrder(categories: any[]) {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;

    if (orderA !== orderB) return orderA - orderB;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}`
    );
  }

  c = c.replace(
    /categories\.filter\(([^)]*)\)/g,
    "sortCategoriesByOrder(categories).filter($1)"
  );

  c = c.replace(
    /categories\.map\(([^)]*)\)/g,
    "sortCategoriesByOrder(categories).map($1)"
  );

  write("app/page.tsx", c);
}

/* 4. Ordenar categorias na página shop */
if (fs.existsSync("app/shop/page.tsx")) {
  let c = read("app/shop/page.tsx");

  if (!c.includes("sortCategoriesByOrder")) {
    c = c.replace(
      /export const revalidate = 0;/,
      `export const revalidate = 0;

function sortCategoriesByOrder(categories: any[]) {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;

    if (orderA !== orderB) return orderA - orderB;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}`
    );
  }

  c = c.replace(
    /const genderCategories = categories\.filter/,
    "const genderCategories = sortCategoriesByOrder(categories).filter"
  );

  write("app/shop/page.tsx", c);
}

/* 5. Adicionar sortOrder ao emptyCategory no ControlPanel */
if (fs.existsSync("components/ControlPanel.tsx")) {
  let c = read("components/ControlPanel.tsx");

  if (!c.includes("sortOrder: 1")) {
    c = c.replace(
      /styles:\s*\[\]/,
      "styles: [],\n  sortOrder: 1"
    );
  }

  /* campo Ordem no formulário */
  if (!c.includes('label="Ordem')) {
    c = c.replace(
      '<Field label="Estilos separados por virgula"',
      '<Field label="Ordem na pagina inicial" type="number" value={(categoryForm as any).sortOrder || 1} onChange={(value) => setCategoryForm({ ...(categoryForm as any), sortOrder: Number(value || 1) })} />\n              <Field label="Estilos separados por virgula"'
    );
  }

  /* mostrar coluna Ordem na tabela */
  c = c.replace(
    "<th>Homepage</th>",
    "<th>Homepage</th><th>Ordem</th>"
  );

  c = c.replace(
    '<td>{category.featured ? "Sim" : "Nao"}</td>',
    '<td>{category.featured ? "Sim" : "Nao"}</td><td>{(category as any).sortOrder || 999}</td>'
  );

  c = c.replace(
    '<td>{category.featured ? "Sim" : "Não"}</td>',
    '<td>{category.featured ? "Sim" : "Não"}</td><td>{(category as any).sortOrder || 999}</td>'
  );

  write("components/ControlPanel.tsx", c);
}

/* 6. Adicionar sortOrder ao painel de personalização da loja */
if (fs.existsSync("components/ShopCustomizationPanel.tsx")) {
  let c = read("components/ShopCustomizationPanel.tsx");

  if (!c.includes("sortOrder?: number")) {
    c = c.replace(
      /introText\?: string;/,
      "introText?: string;\n  sortOrder?: number;"
    );
  }

  if (!c.includes("sortOrder: 1")) {
    c = c.replace(
      /introText:\s*""/,
      'introText: "",\n  sortOrder: 1'
    );
  }

  if (!c.includes('label="Ordem')) {
    c = c.replace(
      '<Field label="Estilos separados por virgula"',
      '<Field label="Ordem na pagina inicial" value={String(category.sortOrder || 1)} onChange={(value) => setCategory({ ...category, sortOrder: Number(value || 1) })} />\n            <Field label="Estilos separados por virgula"'
    );
  }

  c = c.replace(
    "<th>Intro</th>",
    "<th>Intro</th><th>Ordem</th>"
  );

  c = c.replace(
    "<td>{item.introTitle || item.name}</td>",
    "<td>{item.introTitle || item.name}</td><td>{item.sortOrder || 999}</td>"
  );

  write("components/ShopCustomizationPanel.tsx", c);
}

/* 7. Garantir que a API guarda sortOrder */
if (fs.existsSync("app/api/categories/route.ts")) {
  let c = read("app/api/categories/route.ts");

  if (!c.includes("sortOrder")) {
    c = c.replace(
      "const category = await req.json();",
      `const category = await req.json();

  if (category.sortOrder !== undefined) {
    category.sortOrder = Number(category.sortOrder || 1);
  }`
    );
  }

  write("app/api/categories/route.ts", c);
}

console.log("Category ordering applied.");
