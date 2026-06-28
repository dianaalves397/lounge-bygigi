import Nav from "@/components/Nav";
import MobileMoodboard from '@/components/Moodboard/MobileMoodboard';
import ProductCard from "@/components/ProductCard";
import MediaBlock from "@/components/MediaBlock";
import { getProducts, getCategories } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
export const dynamic = "force-dynamic";

function sortCategoriesByOrder(categories: any[]) {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;

    if (orderA !== orderB) return orderA - orderB;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}
export const revalidate = 0;
export default async function Home(){ const settings=await getSettings(); 
  const products=(await getProducts()).filter(p=>p.status==="active").slice(0,8);
   const categories=(await getCategories()).filter(c=>c.featured).slice(0,9); 
   const cssVars={"--bg":settings.layout.background,"--text":settings.layout.text,"--muted":settings.layout.muted,"--accent":settings.layout.accent,"--card":settings.layout.card,"--radius":`${settings.layout.radius}px`,"--category-height":`${settings.layout.categoryCardHeight}px`,"--hero-height":`${settings.layout.heroHeight}vh`} as React.CSSProperties; return <div style={cssVars}><Nav/><main><section className="hero hero-full"><MediaBlock type={settings.home.heroMediaType} url={settings.home.heroMediaUrl} alt={settings.home.heroTitle} className="hero-full-media"/>
   <div className="hero-full-overlay" style={{background:`rgba(33,26,23,${settings.home.heroOverlay/100})`}}/><div className="hero-full-content">
    <p className="eyebrow">{settings.home.heroEyebrow}</p><h1>{settings.home.heroTitle}</h1>
    <p>{settings.home.heroText}</p><div className="hero-actions">
      <Link className="pill light-pill" href="/shop">Shop now</Link>
      <Link className="pill transparent-pill" href="/shop?sale=true">Sale</Link>
      </div></div></section><section className="section"><div className="section-header">
        <div><p className="eyebrow">explore</p>
        <MobileMoodboard />
        <h2>categorias</h2></div></div><div className="category-grid">{sortCategoriesByOrder(categories).map(c=><Link className="category-card" key={c.id} href={`/shop?category=${c.id}`}><MediaBlock type={c.mediaType} url={c.image} alt={c.name}/><div><h3>{c.name}</h3><p>{c.styles.slice(0,3).join(" · ")}</p></div></Link>)}</div></section><section className="section novelty-section"><div className="novelty-media"><MediaBlock type={settings.home.newnessMediaType} url={settings.home.newnessMediaUrl} alt={settings.home.newnessTitle}/></div><div><p className="eyebrow">featured edit</p><h2>{settings.home.newnessTitle}</h2><p className="muted">{settings.home.newnessText}</p><Link className="pill dark-pill" href="/shop">Ver novidades</Link></div></section><section className="section"><div className="section-header"><div><p className="eyebrow">new in</p><h2>novidades</h2></div></div><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div></section></main></div> }


