export function getVerificationEmailTemplate(
  firstName: string,
  verificationUrl: string,
): { subject: string; html: string; text: string } {
  const subject = 'Confirmez votre compte Queen Mama';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px; color: white;">Q</span>
                </div>
                <span style="font-size: 24px; font-weight: bold; background: linear-gradient(90deg, #9333ea, #3b82f6, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Queen Mama</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; text-align: center;">
                Bienvenue, ${firstName} !
              </h1>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Merci de vous etre inscrit sur Queen Mama. Pour activer votre compte et commencer a generer des leads qualifies, veuillez confirmer votre adresse email.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.4);">
                      Verifier mon email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                Ce lien expire dans 24 heures.
              </p>

              <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </p>
              <p style="color: #a855f7; font-size: 12px; word-break: break-all; text-align: center; margin: 8px 0 0 0;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Si vous n'avez pas cree de compte sur Queen Mama, vous pouvez ignorer cet email.
              </p>
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                &copy; ${new Date().getFullYear()} Queen Mama. Tous droits reserves.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Bienvenue sur Queen Mama, ${firstName} !

Merci de vous etre inscrit sur Queen Mama. Pour activer votre compte et commencer a generer des leads qualifies, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

${verificationUrl}

Ce lien expire dans 24 heures.

Si vous n'avez pas cree de compte sur Queen Mama, vous pouvez ignorer cet email.

L'equipe Queen Mama
  `;

  return { subject, html, text };
}
