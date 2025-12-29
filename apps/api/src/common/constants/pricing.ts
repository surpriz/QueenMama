import { MarketDifficulty } from '@prisma/client';

// Constantes de tarification
export const PRICING_CONFIG = {
  // Prix de base selon le TAM (Total Addressable Market)
  TAM_TIERS: [
    { minTam: 10000, basePrice: 30 },
    { minTam: 5000, basePrice: 35 },
    { minTam: 2000, basePrice: 40 },
    { minTam: 1000, basePrice: 45 },
    { minTam: 500, basePrice: 50 },
    { minTam: 0, basePrice: 60 },
  ],

  // Ajustement selon la difficulté du marché
  DIFFICULTY_ADJUSTMENTS: {
    [MarketDifficulty.EASY]: -5,
    [MarketDifficulty.MEDIUM]: 0,
    [MarketDifficulty.HARD]: 5,
    [MarketDifficulty.VERY_HARD]: 10,
  } as Record<MarketDifficulty, number>,

  // Seuils de recommandation
  THRESHOLDS: {
    NO_GO_TAM: 200, // En dessous de 200 prospects = NO_GO
    CAUTION_TAM: 500, // Entre 200 et 500 = GO_WITH_CAUTION
  },

  // Fourchette de prix affichée sur la landing page
  DISPLAY_RANGE: {
    min: 30,
    max: 60,
  },
};

// Types pour les recommandations
export type PricingRecommendation = 'GO' | 'GO_WITH_CAUTION' | 'NO_GO';

export interface PricingAnalysis {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  recommendation: PricingRecommendation;
  reason: string;
  estimatedLeadsPerMonth: { min: number; max: number };
  estimatedRevenuePerMonth: { min: number; max: number };
}

/**
 * Calcule le prix de base selon le TAM
 */
export function getBasePriceFromTam(tam: number): number {
  const tier = PRICING_CONFIG.TAM_TIERS.find((t) => tam >= t.minTam);
  return tier?.basePrice ?? 60;
}

/**
 * Calcule l'ajustement de prix selon la difficulté
 */
export function getDifficultyAdjustment(difficulty: MarketDifficulty): number {
  return PRICING_CONFIG.DIFFICULTY_ADJUSTMENTS[difficulty] ?? 0;
}

/**
 * Calcule le prix recommandé final
 */
export function calculateRecommendedPrice(
  tam: number,
  difficulty: MarketDifficulty,
): number {
  const basePrice = getBasePriceFromTam(tam);
  const adjustment = getDifficultyAdjustment(difficulty);
  return Math.max(25, Math.min(70, basePrice + adjustment)); // Clamp entre 25 et 70
}

/**
 * Génère une analyse complète pour la tarification d'une campagne
 */
export function analyzeCampaignPricing(
  tam: number,
  difficulty: MarketDifficulty,
): PricingAnalysis {
  const recommendedPrice = calculateRecommendedPrice(tam, difficulty);

  // Calcul de la fourchette acceptable (+/- 10€)
  const priceRange = {
    min: Math.max(25, recommendedPrice - 10),
    max: Math.min(70, recommendedPrice + 10),
  };

  // Détermination de la recommandation
  let recommendation: PricingRecommendation;
  let reason: string;

  if (tam < PRICING_CONFIG.THRESHOLDS.NO_GO_TAM) {
    recommendation = 'NO_GO';
    reason = `Marché trop petit (${tam} prospects). Minimum requis : ${PRICING_CONFIG.THRESHOLDS.NO_GO_TAM} prospects.`;
  } else if (tam < PRICING_CONFIG.THRESHOLDS.CAUTION_TAM) {
    recommendation = 'GO_WITH_CAUTION';
    reason = `Marché limité (${tam} prospects). Potentiel de leads restreint. Prix élevé recommandé.`;
  } else {
    recommendation = 'GO';
    reason = `Marché viable (${tam} prospects). Bon potentiel de génération de leads.`;
  }

  // Estimation des leads (hypothèse : 2-4% de taux de réponse positive)
  const responseRateLow = 0.02;
  const responseRateHigh = 0.04;
  const estimatedLeadsPerMonth = {
    min: Math.floor(tam * responseRateLow * 0.1), // ~10% du TAM contactable/mois
    max: Math.floor(tam * responseRateHigh * 0.15),
  };

  // Estimation du revenu
  const estimatedRevenuePerMonth = {
    min: estimatedLeadsPerMonth.min * recommendedPrice,
    max: estimatedLeadsPerMonth.max * recommendedPrice,
  };

  return {
    recommendedPrice,
    priceRange,
    recommendation,
    reason,
    estimatedLeadsPerMonth,
    estimatedRevenuePerMonth,
  };
}

/**
 * Valide si un prix personnalisé est acceptable
 */
export function validateCustomPrice(
  customPrice: number,
  tam: number,
  difficulty: MarketDifficulty,
): { valid: boolean; warning?: string } {
  const analysis = analyzeCampaignPricing(tam, difficulty);

  if (customPrice < 25) {
    return { valid: false, warning: 'Prix minimum : 25€/lead' };
  }

  if (customPrice > 70) {
    return { valid: false, warning: 'Prix maximum : 70€/lead' };
  }

  if (customPrice < analysis.priceRange.min - 5) {
    return {
      valid: true,
      warning: `Prix inférieur à la recommandation (${analysis.recommendedPrice}€). Rentabilité potentiellement faible.`,
    };
  }

  if (customPrice > analysis.priceRange.max + 5) {
    return {
      valid: true,
      warning: `Prix supérieur à la recommandation (${analysis.recommendedPrice}€). Peut décourager le client.`,
    };
  }

  return { valid: true };
}

/**
 * Formate le prix pour l'affichage
 */
export function formatPrice(price: number): string {
  return `${price}€`;
}

/**
 * Formate la fourchette de prix pour l'affichage
 */
export function formatPriceRange(min: number, max: number): string {
  return `${min}€ - ${max}€`;
}
