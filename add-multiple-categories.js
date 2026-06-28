const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

/* 1. Atualizar types.ts para aceitar varias categorias */
if (fs.existsSync("types.ts")) {
  let c = read("types.ts");

  if (!c.includes("categoryIds?: string[]")) {
    c = c.replace(
      /categoryId:\s*string;/,
      "categoryId: string;\n  categoryIds?: string[];"
    );
  }

  write("types.ts", c);
}

/* 2. Migrar produtos locais: categoryIds passa a existir */
if (fs.existsSync("data/products.json")) {
  const products = JSON.parse(read("data/products.json"));

  const next = products.map((product) => {
    const current = Array.isArray(product.categoryIds) ? product.categoryIds : [];
    const main = product.categoryId ? [product.categoryId] : [];
    const categorySlug = product.category
      ? [String(product.category).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")]
      : [];

    return {
      ...product,
      categoryIds: Array.from(new Set([...current, ...main, ...categorySlug].filter(Boolean)))
    };
  });

  write("data/products.json", JSON.stringify(next, null, 2));
}

/* 3. Atualizar pagina shop para filtrar por varias categorias */
if (fs.existsSync("app/shop/page.tsx")) {
  let c = read("app/shop/page.tsx");

  c = c.replace(
    'if (categoryId && product.categoryId !== categoryId) return false;',
    `if (categoryId) {
      const productCategories = Array.from(
        new Set([
          product.categoryId,
          ...(((product as any).categoryIds || []) as string[])
        ].filter(Boolean))
      );

      if (!productCategories.includes(categoryId)) return false;
    }`
  );

  c = c.replace(
    'product.categoryId,',
    'product.categoryId,\n        ...(((product as any).categoryIds || []) as string[]),'
  );

  c = c.replace(
    'product.categoryId === category.id &&',
    `(
        product.categoryId === category.id ||
        (((product as any).categoryIds || []) as string[]).includes(category.id)
      ) &&`
  );

  write("app/shop/page.tsx", c);
}

/* 4. Atualizar painel principal: campo para varias categorias */
if (fs.existsSync("components/ControlPanel.tsx")) {
  let c = read("components/ControlPanel.tsx");

  if (!c.includes("categoryIds: []")) {
    c = c.replace(
      'categoryId: "",',
      'categoryId: "",\n  categoryIds: [],'
    );
  }

  if (!c.includes('label="Categorias extra')) {
    c = c.replace(
      '<Field label="Categoria" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} />',
      `<Field label="Categoria principal" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} />
              <Field label="Categorias extra IDs separados por virgula" value={((productForm as any).categoryIds || []).join(", ")} onChange={(value) => setProductForm({ ...(productForm as any), categoryIds: value.split(",").map((item: string) => item.trim()).filter(Boolean) })} />`
    );
  }

  if (!c.includes("categoryIds: Array.from")) {
    c = c.replace(
      'stock: Number(productForm.stock || 0)',
      `stock: Number(productForm.stock || 0),
      categoryIds: Array.from(
        new Set([
          productForm.categoryId || makeSlug(productForm.category),
          ...(((productForm as any).categoryIds || []) as string[])
        ].filter(Boolean))
      )`
    );
  }

  write("components/ControlPanel.tsx", c);
}

/* 5. Atualizar painel de personalizacao, se existir listagem/edicao de produtos futura nao quebra */
if (fs.existsSync("components/ShopCustomizationPanel.tsx")) {
  let c = read("components/ShopCustomizationPanel.tsx");
  write("components/ShopCustomizationPanel.tsx", c);
}

/* 6. Quando apagar categoria, remover essa categoria das listas categoryIds dos produtos */
if (fs.existsSync("app/api/categories/delete/route.ts")) {
  let c = read("app/api/categories/delete/route.ts");

  c = c.replace(
    `if (String(product.categoryId) === id) {
      return {
        ...product,
        categoryId: "",
        category: product.category || ""
      };
    }

    return product;`,
    `const categoryIds = Array.isArray(product.categoryIds)
      ? product.categoryIds.filter((categoryId: string) => String(categoryId) !== id)
      : [];

    if (String(product.categoryId) === id) {
      return {
        ...product,
        categoryId: categoryIds[0] || "",
        categoryIds,
        category: product.category || ""
      };
    }

    return {
      ...product,
      categoryIds
    };`
  );

  write("app/api/categories/delete/route.ts", c);
}

console.log("Multi-category support applied.");
