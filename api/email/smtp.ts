const https = require('https');

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

function encodeBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

export async function sendMail({ to, subject, html, from }: SendMailOptions): Promise<{ success: boolean; method: string; error?: string }> {
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const fromAddr = from || `"LinkYourArt" <${user}>`;

  if (!host || !user || !pass) {
    console.log(`[EMAIL_SIMULATED] To: ${to}`);
    return { success: true, method: 'simulated' };
  }

  // Utiliser le module net natif Node.js — zéro dépendance
  const net = require('net');
  const tls = require('tls');

  return new Promise((resolve) => {
    const boundary = `lya${Date.now()}`;
    const body = [
      `From: ${fromAddr}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      encodeBase64(html),
      `.`,
    ].join('\r\n');

    let sock: any;
    let upgraded = false;
    let buf = '';
    let step = 0;

    const write = (cmd: string) => {
      console.log('[SMTP >]', cmd.replace(encodeBase64(pass), '***'));
      sock.write(cmd + '\r\n');
    };

    const next = (line: string) => {
      const code = parseInt(line.slice(0, 3));
      console.log('[SMTP <]', line.trim());

      if (code >= 400) {
        sock.destroy();
        resolve({ success: false, method: 'smtp', error: line.trim() });
        return;
      }

      if (step === 0 && code === 220) { step++; write('EHLO linkyourart.com'); return; }
      if (step === 1 && code === 250) {
        if (!upgraded && port === 587) { step++; write('STARTTLS'); return; }
        step = 4; write('AUTH LOGIN'); return;
      }
      if (step === 2 && code === 220) {
        step++;
        const plain = sock;
        sock = tls.connect({ socket: plain, host, rejectUnauthorized: false }, () => {
          sock.on('data', onData);
          write('EHLO linkyourart.com');
          upgraded = true;
        });
        return;
      }
      if (step === 3 && code === 250) { step++; write('AUTH LOGIN'); return; }
      if (step === 4 && code === 334) { step++; write(encodeBase64(user)); return; }
      if (step === 5 && code === 334) { step++; write(encodeBase64(pass)); return; }
      if (step === 6 && code === 235) { step++; write(`MAIL FROM:<${user}>`); return; }
      if (step === 7 && code === 250) { step++; write(`RCPT TO:<${to}>`); return; }
      if (step === 8 && code === 250) { step++; write('DATA'); return; }
      if (step === 9 && code === 354) { step++; sock.write(body + '\r\n'); return; }
      if (step === 10 && code === 250) { step++; write('QUIT'); return; }
      if (step === 11 && code === 221) {
        sock.destroy();
        console.log(`[EMAIL_SENT] ✓ To: ${to}`);
        resolve({ success: true, method: 'smtp' });
      }
    };

    const onData = (data: Buffer) => {
      buf += data.toString();
      const lines = buf.split('\r\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (line) next(line);
      }
    };

    const timer = setTimeout(() => {
      sock?.destroy();
      resolve({ success: false, method: 'smtp', error: 'timeout' });
    }, 20000);

    sock = net.connect(port, host, () => {
      console.log('[SMTP] Connected:', host, port);
    });
    sock.on('data', onData);
    sock.on('error', (err: Error) => {
      clearTimeout(timer);
      resolve({ success: false, method: 'smtp', error: err.message });
    });
    sock.on('close', () => clearTimeout(timer));
  });
}
