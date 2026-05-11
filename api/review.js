const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, title, content, linkedin } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: 'İsim ve yorum zorunludur.' });
  }

  const token = crypto.randomUUID();

  const sbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ name, title, content, linkedin: linkedin || null, token, approved: false }),
  });

  if (!sbRes.ok) {
    console.error('Supabase error:', await sbRes.text());
    return res.status(500).json({ error: 'Yorum kaydedilemedi.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const approveUrl = `https://mustafayagizguven.vercel.app/api/approve?token=${token}`;

  await transporter.sendMail({
    from: `"Portfolyo Değerlendirme" <${process.env.GMAIL_USER}>`,
    to: 'mygzguven@gmail.com',
    replyTo: 'noreply@noreply.com',
    subject: `Yeni değerlendirme onayı bekliyor: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;padding:32px;">
        <h2 style="color:#1a1a2e;margin-bottom:4px;">Yeni Değerlendirme</h2>
        <p style="color:#666;margin-top:0;">Onayladığında sitende yayınlanacak.</p>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;">
        <p><strong>İsim:</strong> ${name}</p>
        ${title ? `<p><strong>Unvan/Şirket:</strong> ${title}</p>` : ''}
        <p><strong>Yorum:</strong></p>
        <p style="background:#fff;border-radius:8px;padding:16px;border:1px solid #e0e0e0;">${content.replace(/\n/g, '<br>')}</p>
        <a href="${approveUrl}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#92ccff;color:#1a1a2e;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">✓ Onayla ve Yayınla</a>
        <p style="color:#999;font-size:12px;margin-top:24px;">mustafayagizguven.vercel.app üzerinden gönderildi.</p>
      </div>
    `,
  });

  return res.status(200).json({ success: true });
};
