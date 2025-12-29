'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calculator,
  Loader2,
  TrendingUp,
  Users,
  Euro,
} from 'lucide-react';
import { useAnalyzePricing, useUpdateCampaignPricing } from '@/hooks/use-admin';
import { AdminCampaign, MarketDifficulty, PricingAnalysis } from '@/lib/api';

interface CampaignPricingAnalyzerProps {
  campaign: AdminCampaign;
  onPricingUpdated?: () => void;
}

const difficultyLabels: Record<MarketDifficulty, string> = {
  [MarketDifficulty.EASY]: 'Facile - Beaucoup de prospects',
  [MarketDifficulty.MEDIUM]: 'Moyen - Marché standard',
  [MarketDifficulty.HARD]: 'Difficile - Peu de prospects',
  [MarketDifficulty.VERY_HARD]: 'Très difficile - Marché niché',
};

const difficultyColors: Record<MarketDifficulty, string> = {
  [MarketDifficulty.EASY]: 'bg-green-100 text-green-700',
  [MarketDifficulty.MEDIUM]: 'bg-blue-100 text-blue-700',
  [MarketDifficulty.HARD]: 'bg-orange-100 text-orange-700',
  [MarketDifficulty.VERY_HARD]: 'bg-red-100 text-red-700',
};

export function CampaignPricingAnalyzer({ campaign, onPricingUpdated }: CampaignPricingAnalyzerProps) {
  const [estimatedTam, setEstimatedTam] = useState<string>(
    campaign.estimatedTam?.toString() || ''
  );
  const [marketDifficulty, setMarketDifficulty] = useState<MarketDifficulty | ''>(
    campaign.marketDifficulty || ''
  );
  const [customPrice, setCustomPrice] = useState<string>(
    campaign.pricePerLead?.toString() || ''
  );
  const [adminNotes, setAdminNotes] = useState<string>(campaign.adminNotes || '');
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);

  const analyzePricing = useAnalyzePricing();
  const updatePricing = useUpdateCampaignPricing();

  // Auto-analyze when TAM and difficulty are set
  useEffect(() => {
    const tam = parseInt(estimatedTam);
    if (tam > 0 && marketDifficulty) {
      handleAnalyze();
    }
  }, [estimatedTam, marketDifficulty]);

  const handleAnalyze = async () => {
    const tam = parseInt(estimatedTam);
    if (!tam || !marketDifficulty) return;

    try {
      const result = await analyzePricing.mutateAsync({
        estimatedTam: tam,
        marketDifficulty,
      });
      setAnalysis(result);
      // Set recommended price as default if no custom price set
      if (!customPrice) {
        setCustomPrice(result.recommendedPrice.toString());
      }
    } catch (error) {
      console.error('Failed to analyze pricing:', error);
    }
  };

  const handleSavePricing = async () => {
    const tam = parseInt(estimatedTam);
    const price = parseFloat(customPrice);

    if (!tam || !marketDifficulty || !price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (price < 25 || price > 70) {
      alert('Le prix doit être entre 25€ et 70€');
      return;
    }

    try {
      await updatePricing.mutateAsync({
        id: campaign.id,
        data: {
          estimatedTam: tam,
          marketDifficulty,
          pricePerLead: price,
          adminNotes: adminNotes || undefined,
        },
      });
      onPricingUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du prix');
    }
  };

  const getRecommendationBadge = (recommendation: PricingAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'GO':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            GO
          </Badge>
        );
      case 'GO_WITH_CAUTION':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 gap-1">
            <AlertTriangle className="h-3 w-3" />
            GO avec prudence
          </Badge>
        );
      case 'NO_GO':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            NO GO
          </Badge>
        );
    }
  };

  const isPricingSet = campaign.pricePerLead !== null && campaign.priceApprovedAt;

  return (
    <Card className={isPricingSet ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Analyse Pricing GO/NO-GO
            </CardTitle>
            <CardDescription>
              {isPricingSet
                ? 'Prix validé et configuré'
                : 'Définir le prix par lead pour cette campagne'}
            </CardDescription>
          </div>
          {isPricingSet && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Prix validé: {campaign.pricePerLead}€/lead
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tam">TAM estimé (nb de prospects sur Apollo)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="tam"
                type="number"
                placeholder="Ex: 2500"
                value={estimatedTam}
                onChange={(e) => setEstimatedTam(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulté du marché</Label>
            <Select
              value={marketDifficulty}
              onValueChange={(value) => setMarketDifficulty(value as MarketDifficulty)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la difficulté" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          difficultyColors[key as MarketDifficulty].split(' ')[0]
                        }`}
                      />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analysis Result */}
        {analyzePricing.isPending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analyse en cours...</span>
          </div>
        )}

        {analysis && !analyzePricing.isPending && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground">Recommandation</p>
                <div className="flex items-center gap-3 mt-1">
                  {getRecommendationBadge(analysis.recommendation)}
                  <span className="text-lg font-semibold">
                    Prix recommandé: {analysis.recommendedPrice}€/lead
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Fourchette: {analysis.priceRange.min}€ - {analysis.priceRange.max}€
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium mb-2">Analyse</p>
              <p className="text-sm text-muted-foreground">{analysis.reason}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Leads estimés/mois
                </div>
                <p className="text-lg font-semibold">
                  {analysis.estimatedLeadsPerMonth.min} - {analysis.estimatedLeadsPerMonth.max}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Euro className="h-4 w-4" />
                  Revenue estimé/mois
                </div>
                <p className="text-lg font-semibold">
                  {analysis.estimatedRevenuePerMonth.min.toFixed(0)}€ -{' '}
                  {analysis.estimatedRevenuePerMonth.max.toFixed(0)}€
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Price Input */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Prix par lead (€)</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="25"
                max="70"
                placeholder="Ex: 45"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Min: 25€ | Max: 70€</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes admin (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Bon marché, prix standard appliqué"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Warning if price differs from recommendation */}
        {analysis && customPrice && Math.abs(parseFloat(customPrice) - analysis.recommendedPrice) > 5 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Prix différent de la recommandation</p>
              <p className="text-sm text-yellow-700">
                Le prix saisi ({customPrice}€) diffère de {Math.abs(parseFloat(customPrice) - analysis.recommendedPrice).toFixed(0)}€
                du prix recommandé ({analysis.recommendedPrice}€).
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleAnalyze}
            disabled={!estimatedTam || !marketDifficulty || analyzePricing.isPending}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Recalculer
          </Button>
          <Button
            onClick={handleSavePricing}
            disabled={!estimatedTam || !marketDifficulty || !customPrice || updatePricing.isPending}
          >
            {updatePricing.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isPricingSet ? 'Mettre à jour le prix' : 'Valider le prix (GO)'}
              </>
            )}
          </Button>
        </div>

        {/* Existing pricing info */}
        {isPricingSet && campaign.priceApprovedAt && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Prix validé le {new Date(campaign.priceApprovedAt).toLocaleDateString('fr-FR')}
              {campaign.priceApprovedBy && ` par admin ${campaign.priceApprovedBy.slice(0, 8)}...`}
            </p>
            {campaign.adminNotes && (
              <p className="text-sm text-muted-foreground mt-1">
                Notes: {campaign.adminNotes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
