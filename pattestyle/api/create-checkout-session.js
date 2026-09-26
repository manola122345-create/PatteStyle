import Stripe from 'stripe';
import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY manquant côté serveur');
      return res.status(500).json({ error: 'Paiement non configuré côté serveur' });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_zone,
      shipping_fee,
      items
    } = req.body || {};

    if (!customer_email || !customer_name || !customer_phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Informations de commande incomplètes' });
    }

    // On ne fait jamais confiance aux prix envoyés par le client : on recharge
    // les prix réels depuis la base pour calculer le montant à payer.
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .select('id, title, price, images, supplier_url')
      .in('id', productIds);
    if (prodErr) throw prodErr;

    const priceMap = new Map(dbProducts.map((p) => [p.id, p]));
    let subtotal = 0;
    const line_items = [];
    const orderItems = [];

    for (const item of items) {
      const p = priceMap.get(item.product_id);
      if (!p) {
        return res.status(400).json({ error: `Produit introuvable (id ${item.product_id})` });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      subtotal += p.price * qty;

      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: { name: p.title },
          unit_amount: Math.round(p.price * 100)
        },
        quantity: qty
      });

      orderItems.push({
        product_id: p.id,
        title: p.title,
        price: p.price,
        quantity: qty,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : item.image || null,
        supplier_url: p.supplier_url || null
      });
    }

    const fee = Math.max(0, parseFloat(shipping_fee) || 0);
    if (fee > 0) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Livraison — ${shipping_zone || 'Europe'}` },
          unit_amount: Math.round(fee * 100)
        },
        quantity: 1
      });
    }

    const total = Math.round((subtotal + fee) * 100) / 100;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const order_number = `PS-2026-${randomSuffix}`;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number,
        customer_name,
        customer_email,
        customer_phone: customer_phone || '',
        shipping_address,
        shipping_zone: shipping_zone || 'Europe Standard',
        shipping_fee: fee,
        items: orderItems,
        subtotal,
        total,
        status: 'En attente de paiement',
        payment_method: 'Stripe CB',
        payment_status: 'En attente',
        tracking_number: null
      }])
      .select()
      .single();
    if (orderError) throw orderError;

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email,
      line_items,
      metadata: { order_id: String(orderData.id), order_number },
      success_url: `${origin}/order-confirmation?order_number=${order_number}`,
      cancel_url: `${origin}/checkout`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('API create-checkout-session error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}
