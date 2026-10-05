import Stripe from 'stripe';
import supabase from './_db-client.js';

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

// Handler au format Web API (Request/Response) de Vercel : c'est la méthode
// fiable pour récupérer le corps brut de la requête, nécessaire pour vérifier
// la signature Stripe. L'ancienne méthode (req, res) + "bodyParser: false"
// ne fonctionne de façon garantie que dans un projet Next.js — ce qui n'est
// pas le cas ici, et empêchait la vérification de passer.
export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe non configuré côté serveur (clé secrète ou secret webhook manquant)');
    return new Response('Stripe non configuré', { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook Stripe invalide:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
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
        } else if (error) {
          console.error('Erreur mise à jour commande:', error);
        }
      } else {
        console.warn('Webhook checkout.session.completed sans order_id en metadata');
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook Stripe:', err);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 });
  }
}
