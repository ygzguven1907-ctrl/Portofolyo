const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolyo İletişim" <${process.env.GMAIL_USER}>`,
      to: 'mygzguven@gmail.com',
      replyTo: email,
      subject: `Yeni mesaj: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#f9f9f9;border-radius:12px;padding:32px;">
          <h2 style="color:#1a1a2e;margin-bottom:4px;">Portfolyo Sitesinden Yeni Mesaj</h2>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;">
          <p><strong>İsim:</strong> ${name}</p>
          <p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Mesaj:</strong></p>
          <p style="background:#fff;border-radius:8px;padding:16px;border:1px solid #e0e0e0;">${message.replace(/\n/g, '<br>')}</p>
          <p style="color:#999;font-size:12px;margin-top:24px;">mustafayagizguven.vercel.app üzerinden gönderildi.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Mail gönderilemedi. Lütfen tekrar deneyin.' });
  }
};
