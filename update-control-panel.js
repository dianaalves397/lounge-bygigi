const fs = require("fs");
const path = require("path");

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function replace(file, search, replacement) {
  let c = read(file);
  if (!c.includes(search)) {
    console.log("Não encontrei bloco em:", file);
    return;
  }
  c = c.replace(search, replacement);
  write(file, c);
}

/* 1. Melhorar DELETE de produtos: produtos manuais são removidos; produtos Printful/Printify ficam ocultos por override */
write("app/api/products/[id]/route.ts", `import { getProducts, saveProducts } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const products = await getProducts();
  const target = products.find((product) => product.id === id);

  if (!target) {
    return Response.json({ ok: true });
  }

  // Produtos vindos de fornecedores não devem ser apagados no fornecedor.
  // Em vez disso, ficam ocultos no site através de override.
  if (
    String(target.id).startsWith("printful-") ||
    String(target.id).startsWith("printify-") ||
    target.source === "printful" ||
    target.source === "printify"
  ) {
    const settings = await getSettings();
    settings.productOverrides = settings.productOverrides || {};
    settings.productOverrides[id] = {
      ...(settings.productOverrides[id] || {}),
      status: "archived"
    };
    await saveSettings(settings);

    return Response.json({ ok: true, hidden: true });
  }

  await saveProducts(products.filter((product) => product.id !== id));

  return Response.json({ ok: true, deleted: true });
}
`);

/* 2. Criar API para editar/apagar categorias */
write("app/api/categories/[id]/route.ts", `import { getCategories, saveCategories } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const patch = await req.json();

  const categories = await getCategories();
  const index = categories.findIndex((category) => category.id === id);

  if (index < 0) {
    return Response.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  categories[index] = {
    ...categories[index],
    ...patch,
    id
  };

  await saveCategories(categories);

  return Response.json(categories[index]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const categories = await getCategories();

  await saveCategories(categories.filter((category) => category.id !== id));

  return Response.json({ ok: true });
}
`);

/* 3. Melhorar ControlPanel: funções para editar/apagar categorias */
let cp = read("components/ControlPanel.tsx");

if (!cp.includes("async function removeCategory")) {
  cp = cp.replace(
`  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm)
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Categoria guardada.");
      setCategoryForm(emptyCategory);
      await loadAll();
    } else {
      setMessage(data.error || "Erro ao guardar categoria.");
    }
  }`,
`  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      ...categoryForm,
      id:
        categoryForm.id ||
        categoryForm.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
    };

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Categoria guardada.");
      setCategoryForm(emptyCategory);
      await loadAll();
    } else {
      setMessage(data.error || "Erro ao guardar categoria.");
    }
  }

  function editCategory(category: Category) {
    setCategoryForm(category);
    setTab("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeCategory(id: string) {
    if (!confirm("Queres mesmo apagar esta categoria?")) return;

    const res = await fetch(\`/api/categories/\${encodeURIComponent(id)}\`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setMessage("Categoria apagada.");
      await loadAll();
    } else {
      setMessage(data.error || "Erro ao apagar categoria.");
    }
  }`
  );
}

/* 4. Trocar chamada da tabela de categorias */
cp = cp.replace(
  "<TableCategories categories={categories} />",
  "<TableCategories categories={categories} onEdit={editCategory} onDelete={removeCategory} />"
);

/* 5. Trocar função TableCategories por versão com botões */
const start = cp.indexOf("function TableCategories");
const end = cp.indexOf("function TableOrders", start);

if (start !== -1 && end !== -1) {
  const before = cp.slice(0, start);
  const after = cp.slice(end);

  const newTable = `function TableCategories({
  categories,
  onEdit,
  onDelete
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Género</th>
            <th>Estilos</th>
            <th>Homepage</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>{category.gender}</td>
              <td>{category.styles.join(", ")}</td>
              <td>{category.featured ? "Sim" : "Não"}</td>
              <td>
                <button className="pill" type="button" onClick={() => onEdit(category)}>
                  Editar
                </button>
                <button className="pill" type="button" onClick={() => onDelete(category.id)}>
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

`;

  cp = before + newTable + after;
}

write("components/ControlPanel.tsx", cp);

console.log("Alterações aplicadas.");
