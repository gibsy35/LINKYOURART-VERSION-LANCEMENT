import { Resend } from 'resend';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendMail({ to, subject, html, from }: SendMailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = from || 'LinkYourArt <contact@linkyourart.com>';

  if (!apiKey) {
    console.log(`[EMAIL_SIMULATED] RESEND_API_KEY manquante — To: ${to}`);
    return { success: true, method: 'simulated' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EMAIL_ERROR] ${JSON.stringify(error)}`);
      return { success: false, method: 'resend', error: JSON.stringify(error) };
    }

    console.log(`[EMAIL_SENT] ✓ id=${data?.id} To: ${to}`);
    return { success: true, method: 'resend' };
  } catch (err: any) {
    console.error(`[EMAIL_ERROR] ${err.message}`);
    return { success: false, method: 'resend', error: err.message };
  }
}
