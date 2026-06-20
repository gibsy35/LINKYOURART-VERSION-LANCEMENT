// SMTP stub - l'envoi réel est géré par api/email/pre-registration.js (JS pur)
// Ce fichier est conservé pour la compatibilité TypeScript des autres handlers

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendMail({ to, subject }: SendMailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  console.log(`[EMAIL_STUB] To: ${to} | Subject: ${subject}`);
  return { success: true, method: 'stub' };
}
