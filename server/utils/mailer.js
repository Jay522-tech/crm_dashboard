const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

    if (!host || !user || !pass) return null;

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });

    return cachedTransporter;
}

async function sendWorkspaceInviteEmail({ to, inviteLink, workspaceName, invitedByEmail }) {
    const transporter = getTransporter();
    if (!transporter) {
        return { ok: false, skipped: true, message: 'SMTP is not configured' };
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const safeWorkspace = workspaceName || 'a workspace';

    const subject = `You're invited to join ${safeWorkspace}`;
    const text =
        `You have been invited${invitedByEmail ? ` by ${invitedByEmail}` : ''} to join "${safeWorkspace}".\n\n` +
        `Accept invite:\n${inviteLink}\n\n` +
        `If you don't have an account, register with this email first.\n`;

    const html = `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin:0 0 12px;">You're invited to join <span style="color:#0f172a;">${escapeHtml(safeWorkspace)}</span></h2>
          <p style="margin:0 0 12px;">
            ${invitedByEmail ? `Invited by <b>${escapeHtml(invitedByEmail)}</b>.` : 'You have been invited.'}
          </p>
          <p style="margin:0 0 16px;">
            <a href="${inviteLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700;">
              Accept invite
            </a>
          </p>
          <p style="margin:0;color:#475569;font-size:13px;">
            Or copy & paste this link:
            <br />
            <span style="word-break:break-all;">${inviteLink}</span>
          </p>
        </div>
    `;

    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { ok: true, messageId: info.messageId };
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

module.exports = { sendWorkspaceInviteEmail };

