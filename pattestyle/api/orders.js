import supabase from './db-client.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { order_number, status } = req.query;

      if (order_number) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', order_number)
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      // Sans order_number, c'est la liste complète (back-office) : admin uniquement
      if (!requireAdmin(req, res)) return;

      let query = supabase.from('orders').select('*');
      if (status && status !== 'Tous') {
        query = query.eq('status', status);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const {
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_zone,
        shipping_fee,
        items,
        subtotal,
        total,
        payment_method
      } = req.body;

      if (!customer_email || !items || items.length === 0) {
        return res.status(400).json({ error: 'Informations de commande incomplètes' });
      }

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
          shipping_fee: parseFloat(shipping_fee || 0),
          items,
          subtotal: parseFloat(subtotal),
          total: parseFloat(total),
          status: 'Payée',
          payment_method: payment_method || 'Stripe CB',
          payment_status: 'Reçu',
          tracking_number: `TRK-EU${Math.floor(100000 + Math.random() * 900000)}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Update or insert customer record
      try {
        const { data: existingCust } = await supabase
          .from('customers')
          .select('*')
          .eq('email', customer_email)
          .single();

        if (existingCust) {
          await supabase
            .from('customers')
            .update({
              total_orders: (existingCust.total_orders || 0) + 1,
              total_spent: parseFloat((existingCust.total_spent || 0) + parseFloat(total)),
              name: customer_name,
              country: shipping_address?.country || existingCust.country
            })
            .eq('id', existingCust.id);
        } else {
          await supabase
            .from('customers')
            .insert([{
              name: customer_name,
              email: customer_email,
              phone: customer_phone || '',
              country: shipping_address?.country || 'France',
              total_orders: 1,
              total_spent: parseFloat(total)
            }]);
        }
      } catch (custErr) {
        console.warn('Customer update non-blocking error:', custErr);
      }

      return res.status(201).json(orderData);
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const { id, status, tracking_number } = req.body;
      if (!id) return res.status(400).json({ error: 'ID commande requis' });

      const updates = {};
      if (status) updates.status = status;
      if (tracking_number !== undefined) updates.tracking_number = tracking_number;

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('API orders error:', err);
    res.status(500).json({ error: err.message });
  }
}
