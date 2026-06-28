const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

/* 1. types.ts: adicionar controlo de visibilidade nas abas Men/Women */
if (fs.existsSync("types.ts")) {
  let c = read("types.ts");

  if (!c.includes("showInMenTab?: boolean")) {
    c = c.replace(
      /sortOrder\?:\s*number;/,
      "sortOrder?: number;\n  showInMenTab?: boolean;\n  showInWomenTab?: boolean;"
    );
  }

  if (!c.includes("showInMenTab?: boolean")) {
    c = c.replace(
      /featured:\s*boolean;/,
      "featured: boolean;\n  sortOrder?: number;\n  showInMenTab?: boolean;\n  showInWomenTab?: boolean;"
    );
  }

  write("types.ts", c);
}

/* 2. Migrar categorias locais */
if (fs.existsSync("data/categories.json")) {
  const categories = JSON.parse(read("data/categories.json"));

  const next = categories.map((category, index) => {
    const gender = category.gender || "unisex";

    return {
      ...category,
      sortOrder:
        typeof category.sortOrder === "number"
          ? category.sortOrder
          : index + 1,
      showInMenTab:
        typeof category.showInMenTab === "boolean"
          ? category.showInMenTab
          : gender === "men" || gender === "unisex",
      showInWomenTab:
        typeof category.showInWomenTab === "boolean"
          ? category.showInWomenTab
          : gender === "women" || gender === "unisex"
    };
  });

  write("data/categories.json", JSON.stringify(next, null, 2));
}

/* 3. Reescrever app/shop/page.tsx para Men/Women mostrarem categorias controladas pela aba */
write("app/shop/page.tsx", `import Link from "next/link";
import Nav from "@/components/Nav";
import ProductCard from "@/components/ProductCard";
import MediaBlock from "@/components/MediaBlock";
import { getProducts, getCategories } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value || "";
}

function sortCategoriesByOrder(categories: any[]) {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;

    if (orderA !== orderB) return orderA - orderB;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function categoryVisibleInGenderTab(category: any, gender: string) {
  const categoryGender = category.gender || "unisex";

  const genderMatches =
    categoryGender === gender ||
    categoryGender === "unisex";

  if (!genderMatches) return false;

  if (gender === "men") {
    return category.showInMenTab !== false;
  }

  return category.showInWomenTab !== false;
}

function productBelongsToCategory(product: any, categoryId: string) {
  const ids = Array.from(
    new Set([
      product.categoryId,
      ...((product.categoryIds || []) as string[])
    ].filter(Boolean))
  );

  return ids.includes(categoryId);
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const gender = getParam(params, "gender") || "women";
  const categoryId = getParam(params, "category");
  const query = getParam(params, "q").toLowerCase().trim();

  const settings = await getSettings();
  const products = await getProducts();
  const categories = await getCategories();

  const isMen = gender === "men";

  const pageConfig =
    isMen
      ? settings.shopPages?.men || {}
      : settings.shopPages?.women || {};

  const visibleProducts = products.filter((product: any) => {
    if (product.status !== "active") return false;

    if (gender && product.gender !== gender && product.gender !== "unisex") {
      return false;
    }

    if (categoryId && !productBelongsToCategory(product, categoryId)) {
      return false;
    }

    if (query) {
      const blob = [
        product.title,
        product.category,
        product.categoryId,
        ...((product.categoryIds || []) as string[]),
        product.collection,
        product.style,
        ...(product.tags || []),
        ...(product.details || [])
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(query);
    }

    return true;
  });

  const genderCategories = sortCategoriesByOrder(categories).filter((category: any) =>
    categoryVisibleInGenderTab(category, gender)
  );

  const selectedCategory = categoryId
    ? categories.find((category: any) => category.id === categoryId)
    : null;

  const heroImage =
    pageConfig.heroMediaUrl ||
    (isMen
      ? "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?q=80&w=1800&auto=format&fit=crop"
      : "https://i.postimg.cc/fbMj7BXh/IMG-0386.jpg");

  const heroTitle =
    pageConfig.heroTitle ||
    (isMen ? "Men editorial essentials" : "Women essentials");

  const heroText =
    pageConfig.heroText ||
    (isMen
      ? "Classic menswear, refined sports pieces and elevated essentials with an editorial finish."
      : "Soft essentials, swimwear, elevated everyday pieces and lounge silhouettes.");

  return (
    <div className={isMen ? "shop-page men-editorial" : "shop-page women-editorial"}>
      <Nav />

      <section className="shop-hero">
        <MediaBlock
          type={pageConfig.heroMediaType || "image"}
          url={heroImage}
          alt={heroTitle}
          className="shop-hero-media"
        />

        <div className="shop-hero-content">
          <p className="eyebrow">{isMen ? "men" : "women"}</p>
          <h1>{heroTitle}</h1>
          <p>{heroText}</p>
        </div>
      </section>

      <main className="section">
        <form className="shop-search" action="/shop">
          <input type="hidden" name="gender" value={gender} />
          {categoryId ? <input type="hidden" name="category" value={categoryId} /> : null}
          <input
            name="q"
            defaultValue={query}
            placeholder="Pesquisar por produto, categoria ou estilo..."
          />
          <button className="pill dark-pill">Pesquisar</button>
        </form>

        {!categoryId && (
          <section className="category-strip">
            <div className="section-heading">
              <p className="eyebrow">{isMen ? "men categories" : "women categories"}</p>
              <h2>Categorias</h2>
            </div>

            <div className="category-grid">
              {genderCategories.map((category: any) => (
                <Link
                  className="category-card"
                  key={category.id}
                  href={\`/shop?gender=\${gender}&category=\${category.id}\`}
                >
                  <MediaBlock
                    type={category.mediaType || "image"}
                    url={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"}
                    alt={category.name}
                  />
                  <div>
                    <p>{category.name}</p>
                    <span>{category.styles?.slice(0, 3).join(" · ")}</span>
                  </div>
                </Link>
              ))}
            </div>

            {genderCategories.length === 0 ? (
              <p className="muted">Ainda nao existem categorias ativas nesta aba.</p>
            ) : null}
          </section>
        )}

        {selectedCategory && (
          <section className="category-intro">
            <div>
              <p className="eyebrow">{isMen ? "men collection" : "women collection"}</p>
              <h2>{(selectedCategory as any).introTitle || selectedCategory.name}</h2>
              <p>
                {(selectedCategory as any).introText ||
                  \`Explora a categoria \${selectedCategory.name}, com pecas selecionadas para o estilo Lounge by Gigi.\`}
              </p>

              <div className="category-actions">
                <Link className="pill" href={\`/shop?gender=\${gender}\`}>
                  Ver todas as categorias
                </Link>
              </div>
            </div>

            {selectedCategory.image ? (
              <MediaBlock
                type={selectedCategory.mediaType || "image"}
                url={selectedCategory.image}
                alt={selectedCategory.name}
                className="category-intro-media"
              />
            ) : null}
          </section>
        )}

        <section className="product-section">
          <div className="section-heading">
            <p className="eyebrow">{visibleProducts.length} produtos</p>
            <h2>{selectedCategory ? selectedCategory.name : isMen ? "Men" : "Women"}</h2>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product: any) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>

          {visibleProducts.length === 0 ? (
            <p className="muted">Ainda nao existem produtos nesta selecao.</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
`);

/* 4. ControlPanel: adicionar campos para mostrar nas abas Men/Women */
if (fs.existsSync("components/ControlPanel.tsx")) {
  let c = read("components/ControlPanel.tsx");

  if (!c.includes("showInMenTab")) {
    c = c.replace(
      /sortOrder:\s*1/,
      "sortOrder: 1,\n  showInMenTab: true,\n  showInWomenTab: true"
    );

    c = c.replace(
      '<Select label="Mostrar na pagina inicial"',
      '<Select label="Mostrar na aba Men" value={(categoryForm as any).showInMenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategoryForm({ ...(categoryForm as any), showInMenTab: value === "yes" })} />\\n              <Select label="Mostrar na aba Women" value={(categoryForm as any).showInWomenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategoryForm({ ...(categoryForm as any), showInWomenTab: value === "yes" })} />\\n              <Select label="Mostrar na pagina inicial"'
    );

    c = c.replace(
      '<Select label="Mostrar na homepage"',
      '<Select label="Mostrar na aba Men" value={(categoryForm as any).showInMenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategoryForm({ ...(categoryForm as any), showInMenTab: value === "yes" })} />\\n              <Select label="Mostrar na aba Women" value={(categoryForm as any).showInWomenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategoryForm({ ...(categoryForm as any), showInWomenTab: value === "yes" })} />\\n              <Select label="Mostrar na homepage"'
    );

    c = c.replace(
      "<th>Homepage</th>",
      "<th>Homepage</th><th>Aba Men</th><th>Aba Women</th>"
    );

    c = c.replace(
      '<td>{category.featured ? "Sim" : "Nao"}</td>',
      '<td>{category.featured ? "Sim" : "Nao"}</td><td>{(category as any).showInMenTab !== false ? "Sim" : "Nao"}</td><td>{(category as any).showInWomenTab !== false ? "Sim" : "Nao"}</td>'
    );

    c = c.replace(
      '<td>{category.featured ? "Sim" : "Não"}</td>',
      '<td>{category.featured ? "Sim" : "Não"}</td><td>{(category as any).showInMenTab !== false ? "Sim" : "Nao"}</td><td>{(category as any).showInWomenTab !== false ? "Sim" : "Nao"}</td>'
    );
  }

  write("components/ControlPanel.tsx", c);
}

/* 5. ShopCustomizationPanel: adicionar controlos Men/Women */
if (fs.existsSync("components/ShopCustomizationPanel.tsx")) {
  let c = read("components/ShopCustomizationPanel.tsx");

  if (!c.includes("showInMenTab?: boolean")) {
    c = c.replace(
      /sortOrder\?:\s*number;/,
      "sortOrder?: number;\n  showInMenTab?: boolean;\n  showInWomenTab?: boolean;"
    );
  }

  if (!c.includes("showInMenTab: true")) {
    c = c.replace(
      /sortOrder:\s*1/,
      "sortOrder: 1,\n  showInMenTab: true,\n  showInWomenTab: true"
    );
  }

  if (!c.includes('label="Mostrar na aba Men')) {
    c = c.replace(
      '<Select label="Mostrar na homepage"',
      '<Select label="Mostrar na aba Men" value={category.showInMenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategory({ ...category, showInMenTab: value === "yes" })} />\\n            <Select label="Mostrar na aba Women" value={category.showInWomenTab !== false ? "yes" : "no"} options={["yes", "no"]} onChange={(value) => setCategory({ ...category, showInWomenTab: value === "yes" })} />\\n            <Select label="Mostrar na homepage"'
    );

    c = c.replace(
      "<th>Genero</th>",
      "<th>Genero</th><th>Aba Men</th><th>Aba Women</th>"
    );

    c = c.replace(
      "<td>{item.gender}</td>",
      '<td>{item.gender}</td><td>{item.showInMenTab !== false ? "Sim" : "Nao"}</td><td>{item.showInWomenTab !== false ? "Sim" : "Nao"}</td>'
    );
  }

  write("components/ShopCustomizationPanel.tsx", c);
}

/* 6. Garantir que API normaliza os novos campos */
if (fs.existsSync("app/api/categories/route.ts")) {
  let c = read("app/api/categories/route.ts");

  if (!c.includes("showInMenTab = category.showInMenTab")) {
    c = c.replace(
      "if (category.sortOrder !== undefined) {",
      `category.showInMenTab = category.showInMenTab !== false;
  category.showInWomenTab = category.showInWomenTab !== false;

  if (category.sortOrder !== undefined) {`
    );
  }

  write("app/api/categories/route.ts", c);
}

console.log("Men/Women tab category visibility applied.");
