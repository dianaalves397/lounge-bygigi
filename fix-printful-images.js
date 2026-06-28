const fs = require("fs");

const file = "lib/printful.ts";

if (!fs.existsSync(file)) {
  console.log("Nao encontrei lib/printful.ts");
  process.exit(1);
}

let c = fs.readFileSync(file, "utf8");

/*
  Injeta funcoes auxiliares para escolher melhor imagens de mockup.
*/
if (!c.includes("function isGoodPrintfulImage")) {
  c = c.replace(
    'function price(base:number, settings:any){',
`function isGoodPrintfulImage(url: any) {
  const value = String(url || "").trim();

  if (!value) return false;
  if (value.includes(".svg")) return false;
  if (value.includes("placeholder")) return false;
  if (value.includes("undefined")) return false;
  if (value.includes("null")) return false;

  return value.startsWith("http");
}

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(isGoodPrintfulImage)));
}

function choosePrintfulMainImage(product: any, detail: any, variants: any[]) {
  const variantImages = variants.flatMap((variant: any) =>
    (variant.files || [])
      .map((file: any) => file.preview_url || file.thumbnail_url)
      .filter(isGoodPrintfulImage)
  );

  const candidates = uniqueImages([
    product?.thumbnail_url,
    detail?.sync_product?.thumbnail_url,
    ...variantImages
  ]);

  return (
    candidates[0] ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
  );
}

function choosePrintfulGallery(product: any, detail: any, variants: any[]) {
  const variantImages = variants.flatMap((variant: any) =>
    (variant.files || [])
      .flatMap((file: any) => [
        file.preview_url,
        file.thumbnail_url
      ])
      .filter(isGoodPrintfulImage)
  );

  return uniqueImages([
    product?.thumbnail_url,
    detail?.sync_product?.thumbnail_url,
    ...variantImages
  ]);
}

function price(base:number, settings:any){`
  );
}

/*
  Substitui a escolha antiga da imagem principal e galeria.
*/
c = c.replace(
  /const image\s*=\s*v\?\.files\?\.\[0\]\?\.preview_url\|\|p\.thumbnail_url\|\|"https:\/\/images\.unsplash\.com\/photo-1441986300917-64674bd600d8\?q=80&w=1200&auto=format&fit=crop";/,
  'const image = choosePrintfulMainImage(p, detail, variants);'
);

c = c.replace(
  /const gallery\s*=\s*Array\.from\(new Set\(variants\.flatMap\(\(x:any\)=>\(x\.files\|\|\[\]\)\.map\(\(f:any\)=>f\.preview_url\)\)\.filter\(Boolean\)\)\) as string\[\];/,
  'const gallery = choosePrintfulGallery(p, detail, variants);'
);

/*
  Garantir que o produto não fica automaticamente com categoria printful.
*/
c = c.replace(/categoryId:"printful"/g, 'categoryId:""');
c = c.replace(/category:"Printful"/g, 'category:""');
c = c.replace(/collection:"printful"/g, 'collection:""');

fs.writeFileSync(file, c, "utf8");

console.log("Printful image selection improved.");
