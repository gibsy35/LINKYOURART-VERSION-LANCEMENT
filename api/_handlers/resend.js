// Shared email-sending helper using the Resend API instead of a hand-rolled
// raw-socket SMTP client talking to OVH's shared mail relay. OVH's mutual
// SMTP relay had no DKIM signing of its own and shares IP reputation with
// every other OVH hosting customer, which is why LYA's transactional emails
// (pre-registration confirmations, welcome emails, access approvals) were
// consistently landing in spam. Resend signs with DKIM against the verified
// linkyourart.com domain and uses its own dedicated sending infrastructure.
//
// This file lives under api/_handlers/ (excluded from Vercel's function
// detection because the parent folder is prefixed with "_") so it does not
// count as its own serverless function -- it's just a shared module required
// by the actual route handlers.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = 'LinkYourArt <contact@linkyourart.com>';

/**
 * Send a transactional email via the Resend API.
 * @param {Object} opts
 * @param {string} opts.to - recipient email address
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string} [opts.from] - defaults to "LinkYourArt <contact@linkyourart.com>"
 * @param {string} [opts.replyTo] - defaults to contact@linkyourart.com
 * @returns {Promise<{ok: boolean, id?: string, err?: string}>}
 */
async function sendEmail({ to, subject, html, from, replyTo }) {
  if (!RESEND_API_KEY) {
    return { ok: false, err: 'RESEND_API_KEY not configured' };
  }
  if (!to || !subject || !html) {
    return { ok: false, err: 'Missing to/subject/html' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        reply_to: replyTo || 'contact@linkyourart.com',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[RESEND] Send failed:', response.status, data);
      return { ok: false, err: (data && data.message) || `HTTP ${response.status}` };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[RESEND] Network/parse error:', err.message || err);
    return { ok: false, err: String(err.message || err) };
  }
}

module.exports = { sendEmail };
