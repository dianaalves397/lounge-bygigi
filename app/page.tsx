import Nav from "@/components/Nav";
import HeroSplit from "@/components/editorial/HeroSplit";
import { getProducts, getCategories } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const products = (await getProducts())
    .filter(p => p.status === "active")
    .slice(0, 8);
  const categories = (await getCategories())
    .filter(c => c.featured)
    .slice(0, 6);

  return (
    <>
      <Nav />
      <main className="home-page">
        {/* Premium Hero with Gender Split */}
        <HeroSplit />

        {/* Featured Products Section */}
        <section className="featured-products-section">
          <div className="page-max-width">
            <div className="section-header">
              <p className="eyebrow">Curated Selection</p>
              <h2>Featured Pieces</h2>
            </div>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="categories-preview-section">
          <div className="page-max-width">
            <div className="section-header">
              <p className="eyebrow">Explore</p>
              <h2>Collections</h2>
            </div>
            <div className="categories-preview-grid">
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="category-preview-card"
                >
                  <div
                    className="category-preview-media"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <div className="category-preview-overlay" />
                  <div className="category-preview-content">
                    <h3>{category.name}</h3>
                    {category.introTitle && <p>{category.introTitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
