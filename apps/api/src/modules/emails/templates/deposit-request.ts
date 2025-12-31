export function getDepositRequestTemplate(
  customerFirstName: string,
  campaignName: string,
  pricePerLead: number,
  depositAmount: number,
  checkoutUrl: string,
): { subject: string; html: string; text: string } {
  const subject = `Action requise : Depot pour votre campagne "${campaignName}"`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Depot requis</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header with Queen Mama logo -->
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
                Votre campagne est prete !
              </h1>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Bonjour ${customerFirstName}, nous avons analyse votre campagne
                "<strong style="color: #ffffff;">${campaignName}</strong>" et defini le prix par lead.
              </p>

              <!-- Pricing Card -->
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Prix par lead</p>
                <p style="color: #22c55e; font-size: 36px; font-weight: bold; margin: 0;">${pricePerLead.toFixed(2)} EUR</p>
              </div>

              <!-- Deposit Info -->
              <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1)); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(34, 197, 94, 0.3);">
                <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0; text-align: center;">
                  Depot de garantie requis
                </h3>
                <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; text-align: center;">
                  Pour activer votre campagne, un depot equivalent a 2 leads est necessaire.
                </p>
                <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 0; text-align: center;">
                  ${depositAmount.toFixed(2)} EUR
                </p>
                <p style="color: #71717a; font-size: 12px; margin: 12px 0 0 0; text-align: center;">
                  Ce depot vous donne acces aux 2 premiers leads sans frais supplementaires.
                </p>
              </div>

              <!-- Benefits List -->
              <table style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #22c55e; margin-right: 8px;">&#10003;</span>
                    <span style="color: #a1a1aa; font-size: 14px;">2 premiers leads inclus dans le depot</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #22c55e; margin-right: 8px;">&#10003;</span>
                    <span style="color: #a1a1aa; font-size: 14px;">Campagne activee immediatement apres paiement</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #22c55e; margin-right: 8px;">&#10003;</span>
                    <span style="color: #a1a1aa; font-size: 14px;">Paiement securise via Stripe</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="${checkoutUrl}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 18px; border-radius: 8px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
                      Payer le depot et activer ma campagne
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
                Ce lien de paiement expire dans 24 heures.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Vous recevez cet email car vous avez cree une campagne sur Queen Mama.
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
Votre campagne est prete ! - Queen Mama

Bonjour ${customerFirstName},

Nous avons analyse votre campagne "${campaignName}" et defini le prix par lead a ${pricePerLead.toFixed(2)} EUR.

DEPOT DE GARANTIE REQUIS
========================

Pour activer votre campagne, un depot equivalent a 2 leads est necessaire.

Montant du depot : ${depositAmount.toFixed(2)} EUR

Ce depot vous donne acces aux 2 premiers leads sans frais supplementaires.

Avantages :
- 2 premiers leads inclus dans le depot
- Campagne activee immediatement apres paiement
- Paiement securise via Stripe

Payez le depot pour activer votre campagne :
${checkoutUrl}

Ce lien de paiement expire dans 24 heures.

L'equipe Queen Mama
  `;

  return { subject, html, text };
}
