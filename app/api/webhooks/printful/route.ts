import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // Inicializa o cliente com as chaves que tens no .env
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const body = await req.json();

  // Verifica se é um evento de produto da Printful
  if (body.type === 'product.created' || body.type === 'product.updated') {
    const p = body.data.sync_product;
    
    // Insere ou atualiza no Supabase
    const { error } = await supabase.from('products').upsert({
      id: p.id,
      name: p.name,
      price: p.retail_price,
      image: p.thumbnail_url
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}