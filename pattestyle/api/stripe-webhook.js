import Stripe from 'stripe';
import supabase from './db-client.js';

export const config = {
  api: { bodyParser: false }
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

async function sendOrderNotificationEmail(order) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY absent : pas de notification email envoyée.');
    return;
  }
  const to = process.env.ORDER_NOTIFICATION_EMAIL || 'shoppattes@gmail.com';
  const itemsList = (order.items || [])
    .map((i) => `- ${i.title} x${i.quantity} (${i.price} €)${i.supplier_url ? `\n  Fournisseur : ${i.supplier_url}` : ''}`)
    .join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.ORDER_NOTIFICATION_FROM || 'PatteStyle <onboarding@resend.dev>',
      to: [to],
      subject: `Nouvelle commande ${order.order_number} — ${order.total} €`,
      text: `Nouvelle commande payée !\n\nN° commande : ${order.order_number}\nClient : ${order.customer_name} (${order.customer_email})\nTéléphone : ${order.customer_phone || '-'}\nTotal : ${order.total} €\n\nArticles :\n${itemsList}\n\nAdresse de livraison :\n${JSON.stringify(order.shipping_address, null, 2)}`
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Erreur envoi email Resend:', text);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe non configuré côté serveur (clé secrète ou secret webhook manquant)');
    return res.status(500).send('Stripe non configuré');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook Stripe invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        const { data: order, error } = await supabase
          .from('orders')
          .update({
            status: 'Payée',
            payment_status: 'Reçu',
            tracking_number: `TRK-EU${Math.floor(100000 + Math.random() * 900000)}`
          })
          .eq('id', orderId)
          .select()
          .single();

        if (!error && order) {
          await sendOrderNotificationEmail(order).catch((e) => console.error('Email notif error:', e));

          try {
            const { data: existingCust } = await supabase
              .from('customers')
              .select('*')
              .eq('email', order.customer_email)
              .single();

            if (existingCust) {
              await supabase.from('customers').update({
                total_orders: (existingCust.total_orders || 0) + 1,
                total_spent: parseFloat((existingCust.total_spent || 0) + parseFloat(order.total)),
                name: order.customer_name,
                country: order.shipping_address?.country || existingCust.country
              }).eq('id', existingCust.id);
            } else {
              await supabase.from('customers').insert([{
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone || '',
                country: order.shipping_address?.country || 'France',
                total_orders: 1,
                total_spent: parseFloat(order.total)
              }]);
            }
          } catch (custErr) {
            console.warn('Customer update non-blocking error:', custErr);
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook Stripe:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
