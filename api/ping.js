// Handler JS pur - zero compilation TypeScript
module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    SMTP_HOST: process.env.SMTP_HOST || 'ABSENT',
    SMTP_PORT: process.env.SMTP_PORT || 'ABSENT',
    SMTP_USER: process.env.SMTP_USER || 'ABSENT',
    SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'ABSENT',
    ANTHROPIC: process.env.ANTHROPIC_API_KEY ? 'SET' : 'ABSENT',
    node: process.version,
    time: new Date().toISOString()
  });
};
