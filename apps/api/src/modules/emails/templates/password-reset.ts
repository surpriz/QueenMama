export function getPasswordResetEmailTemplate(
  firstName: string,
  resetUrl: string,
): { subject: string; html: string; text: string } {
  const subject = 'Réinitialisez votre mot de passe Queen Mama';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Email</title>
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
                Reinitialisation de mot de passe
              </h1>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Bonjour ${firstName}, vous avez demande a reinitialiser votre mot de passe Queen Mama. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.4);">
                      Reinitialiser mon mot de passe
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
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Si vous n'avez pas demande cette reinitialisation, vous pouvez ignorer cet email en toute securite. Votre mot de passe ne sera pas modifie.
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
Reinitialisation de mot de passe - Queen Mama

Bonjour ${firstName},

Vous avez demande a reinitialiser votre mot de passe Queen Mama. Pour choisir un nouveau mot de passe, cliquez sur le lien ci-dessous :

${resetUrl}

Ce lien expire dans 24 heures.

Si vous n'avez pas demande cette reinitialisation, vous pouvez ignorer cet email en toute securite. Votre mot de passe ne sera pas modifie.

L'equipe Queen Mama
  `;

  return { subject, html, text };
}
