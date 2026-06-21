// Handler unifié : monthly-report + notifications + project-alert
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type = 'notification' } = req.body || {};
  console.log(`[EMAIL_UNIFIED] type=${type}`);
  return res.status(200).json({ success: true, type });
};
