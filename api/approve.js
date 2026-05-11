module.exports = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Geçersiz onay linki.');
  }

  const sbRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/reviews?token=eq.${token}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ approved: true }),
    }
  );

  if (!sbRes.ok) {
    console.error('Supabase approve error:', await sbRes.text());
    return res.status(500).send('Onaylama başarısız oldu.');
  }

  res.setHeader('Location', 'https://mustafayagizguven.vercel.app/#degerlendirmeler');
  return res.status(302).end();
};
