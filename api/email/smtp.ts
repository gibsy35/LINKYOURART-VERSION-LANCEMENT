import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendMail({ to, subject, html, from }: SendMailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = from || process.env.SMTP_FROM || '"LinkYourArt" <contact@linkyourart.com>';

  if (!host || !user || !pass) {
    // Mode simulation — log en dev, pas d'erreur en prod
    console.log(`[EMAIL_SIMULATED] To: ${to} | Subject: ${subject}`);
    return { success: true, method: 'simulated' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({ from: fromAddress, to, subject, html });
    console.log(`[EMAIL_SENT] ✓ To: ${to} | Subject: ${subject}`);
    return { success: true, method: 'smtp' };
  } catch (err: any) {
    console.error(`[EMAIL_ERROR] To: ${to} | ${err.message}`);
    return { success: false, method: 'smtp', error: err.message };
  }
}
