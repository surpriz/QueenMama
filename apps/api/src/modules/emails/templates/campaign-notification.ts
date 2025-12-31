export function getCampaignNotificationTemplate(
  adminFirstName: string,
  customerName: string,
  campaignName: string,
  campaignDescription: string | null,
  targetCriteria: any,
  budget: number,
  maxLeads: number | null,
  campaignId: string,
  adminDashboardUrl: string,
): { subject: string; html: string; text: string } {
  const subject = `Nouvelle campagne créée : ${campaignName}`;

  // Helper function to format targetCriteria JSON into readable string
  const formatCriteria = (criteria: any): string => {
    const parts: string[] = [];
    if (criteria.industries?.length) {
      parts.push(`Industries: ${criteria.industries.join(', ')}`);
    }
    if (criteria.locations?.length) {
      parts.push(`Localisations: ${criteria.locations.join(', ')}`);
    }
    if (criteria.companySizes?.length) {
      parts.push(`Tailles: ${criteria.companySizes.join(', ')}`);
    }
    if (criteria.titles?.length) {
      parts.push(`Titres: ${criteria.titles.join(', ')}`);
    }
    return parts.join(' | ') || 'Non spécifié';
  };

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle Campagne</title>
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
                Nouvelle Campagne Créée
              </h1>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Bonjour ${adminFirstName}, une nouvelle campagne nécessite votre analyse de marché.
              </p>

              <!-- Campaign Details Table -->
              <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Nom de la campagne</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${campaignName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Client</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${customerName}</td>
                </tr>
                ${
                  campaignDescription
                    ? `
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Description</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${campaignDescription}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Critères ICP</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${formatCriteria(targetCriteria)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Budget</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${budget.toFixed(2)} €</td>
                </tr>
                ${
                  maxLeads
                    ? `
                <tr>
                  <td style="padding: 12px; color: #71717a; font-size: 14px;">Nombre max de leads</td>
                  <td style="padding: 12px; color: #ffffff; font-size: 14px;">${maxLeads}</td>
                </tr>
                `
                    : ''
                }
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="${adminDashboardUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.4);">
                      Analyser la campagne
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Cette notification est envoyée aux administrateurs Queen Mama.
              </p>
              <p style="color: #52525b; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                &copy; ${new Date().getFullYear()} Queen Mama. Tous droits réservés.
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
Nouvelle Campagne Créée - Queen Mama

Bonjour ${adminFirstName},

Une nouvelle campagne nécessite votre analyse de marché :

Nom : ${campaignName}
Client : ${customerName}
${campaignDescription ? `Description : ${campaignDescription}\n` : ''}Critères ICP : ${formatCriteria(targetCriteria)}
Budget : ${budget.toFixed(2)} €
${maxLeads ? `Nombre max de leads : ${maxLeads}\n` : ''}
Analysez cette campagne :
${adminDashboardUrl}

L'équipe Queen Mama
  `;

  return { subject, html, text };
}
