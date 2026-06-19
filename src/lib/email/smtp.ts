import * as net from 'net';
import * as tls from 'tls';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

function base64(str: string): string {
  return Buffer.from(str).toString('base64');
}

function encodeQuotedPrintable(str: string): string {
  return str.replace(/[^\x20-\x7E\n\r\t]/g, (c) => {
    const hex = c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
    return `=${hex}`;
  });
}

function buildRawEmail(opts: { from: string; to: string; subject: string; html: string }): string {
  const boundary = `lya_${Date.now()}_boundary`;
  const lines = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: =?UTF-8?B?${base64(opts.subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    encodeQuotedPrintable(opts.html),
    ``,
    `--${boundary}--`,
    ``,
  ];
  return lines.join('\r\n');
}

async function smtpSend(opts: {
  host: string; port: number; user: string; pass: string;
  from: string; to: string; subject: string; html: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = 15000;
    let socket: net.Socket | tls.TLSSocket;
    let step = 0;
    const cmds: string[] = [];
    let timer: NodeJS.Timeout;

    const raw = buildRawEmail({ from: opts.from, to: opts.to, subject: opts.subject, html: opts.html });

    const send = (cmd: string) => {
      socket.write(cmd + '\r\n');
    };

    const onData = (data: Buffer) => {
      const line = data.toString();
      console.log('[SMTP <]', line.trim());

      if (line.startsWith('220') && step === 0) { step++; send(`EHLO linkyourart.com`); return; }
      if (line.startsWith('250') && step === 1) {
        // Upgrade to STARTTLS if available
        if (line.includes('STARTTLS') || opts.port === 587) { step++; send('STARTTLS'); return; }
        step = 3; send(`AUTH LOGIN`); return;
      }
      if (line.startsWith('220') && step === 2) {
        // Upgrade socket to TLS
        const plainSocket = socket as net.Socket;
        const tlsSocket = tls.connect({ socket: plainSocket, host: opts.host, rejectUnauthorized: false }, () => {
          socket = tlsSocket;
          socket.on('data', onData);
          step = 3;
          send(`EHLO linkyourart.com`);
        });
        tlsSocket.on('error', reject);
        return;
      }
      if ((line.startsWith('250') && step === 3)) { step++; send('AUTH LOGIN'); return; }
      if (line.startsWith('334') && step === 4) { step++; send(base64(opts.user)); return; }
      if (line.startsWith('334') && step === 5) { step++; send(base64(opts.pass)); return; }
      if (line.startsWith('235') && step === 6) { step++; send(`MAIL FROM:<${opts.user}>`); return; }
      if (line.startsWith('250') && step === 7) { step++; send(`RCPT TO:<${opts.to}>`); return; }
      if (line.startsWith('250') && step === 8) { step++; send('DATA'); return; }
      if (line.startsWith('354') && step === 9) { step++; socket.write(raw + '\r\n.\r\n'); return; }
      if (line.startsWith('250') && step === 10) { step++; send('QUIT'); return; }
      if (line.startsWith('221') && step === 11) { clearTimeout(timer); socket.destroy(); resolve(); return; }
      if (line.startsWith('4') || line.startsWith('5')) { clearTimeout(timer); socket.destroy(); reject(new Error(`SMTP error: ${line.trim()}`)); }
    };

    timer = setTimeout(() => { socket?.destroy(); reject(new Error('SMTP timeout')); }, timeout);

    socket = net.connect({ host: opts.host, port: opts.port }, () => {
      console.log('[SMTP] Connected to', opts.host, opts.port);
    });
    socket.on('data', onData);
    socket.on('error', (err) => { clearTimeout(timer); reject(err); });
    socket.on('close', () => { clearTimeout(timer); });
  });
}

export async function sendMail({ to, subject, html, from }: SendMailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = from || `"LinkYourArt" <${user || 'contact@linkyourart.com'}>`;

  if (!host || !user || !pass) {
    console.log(`[EMAIL_SIMULATED] To: ${to} | SMTP vars missing`);
    return { success: true, method: 'simulated' };
  }

  try {
    await smtpSend({ host, port, user, pass, from: fromAddress, to, subject, html });
    console.log(`[EMAIL_SENT] ✓ To: ${to}`);
    return { success: true, method: 'smtp-native' };
  } catch (err: any) {
    console.error(`[EMAIL_ERROR] ${err.message}`);
    return { success: false, method: 'smtp-native', error: err.message };
  }
}
