export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquant : impossible d\'envoyer le message de contact');
      return res.status(500).json({ error: "L'envoi du message n'est pas configuré côté serveur" });
    }

    const to = process.env.CONTACT_EMAIL || 'shoppattes@gmail.com';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.ORDER_NOTIFICATION_FROM || 'PatteStyle <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `[Contact PatteStyle] ${subject}`,
        text: `Nouveau message de contact\n\nNom : ${name}\nEmail : ${email}\nSujet : ${subject}\n\nMessage :\n${message}`
      })
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.error('Erreur envoi email contact:', text);
      return res.status(500).json({ error: "Échec de l'envoi du message" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('API contact error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
