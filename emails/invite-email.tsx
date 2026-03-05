interface InviteEmailProps {
  name: string;
  inviteUrl: string;
  inviterName: string;
}

export function InviteEmailHtml({ name, inviteUrl, inviterName }: InviteEmailProps): string {
  const firstName = name.split(" ")[0];
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body style="background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f1c48 0%,#c0392b 100%);padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0;letter-spacing:-0.5px;">
                Zyre<span style="color:#ef4444;">Link</span>
              </h1>
              <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:6px 0 0;letter-spacing:3px;text-transform:uppercase;">Digital Business Cards</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0f1c48;font-size:22px;font-weight:700;margin:0 0 12px;">You're invited, ${firstName}! 👋</h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 16px;">
                <strong>${inviterName}</strong> has invited you to join <strong>Zyre Link</strong> — your company's digital business card platform.
              </p>
              <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 32px;">
                Click the button below to set your password and activate your account. This invite link expires in <strong>48 hours</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f1c48 0%,#1e3a8a 100%);color:#ffffff;font-size:15px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                      Accept Invite &amp; Set Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#9ca3af;font-size:12px;text-align:center;margin:24px 0 0;word-break:break-all;">
                Or copy this link: <a href="${inviteUrl}" style="color:#0f1c48;">${inviteUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;text-align:center;">
                © ${year} Zyre Pharmaceuticals. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
