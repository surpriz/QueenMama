'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useCreateLead } from '@/hooks/use-admin';
import { useAdminCampaigns } from '@/hooks/use-admin';
import { CreateLeadDto, LeadStatus, Sentiment } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();
  const { data: campaigns } = useAdminCampaigns();

  // Form state
  const [formData, setFormData] = useState<CreateLeadDto>({
    campaignId: '',
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    title: '',
    linkedinUrl: '',
    phone: '',
    companySize: '',
    companyIndustry: '',
    location: '',
    status: LeadStatus.QUALIFIED,
    qualityScore: 75,
    sentiment: Sentiment.POSITIVE,
    responseContent: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof CreateLeadDto,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.campaignId) newErrors.campaignId = 'Campaign is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.title) newErrors.title = 'Job title is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Remove empty optional fields
      const cleanedData: CreateLeadDto = {
        ...formData,
        linkedinUrl: formData.linkedinUrl || undefined,
        phone: formData.phone || undefined,
        companySize: formData.companySize || undefined,
        companyIndustry: formData.companyIndustry || undefined,
        location: formData.location || undefined,
        responseContent: formData.responseContent || undefined,
        qualityScore: formData.qualityScore || undefined,
      };

      await createLead.mutateAsync(cleanedData);
      router.push('/admin/leads');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lead');
    }
  };

  // Filter active campaigns
  const activeCampaigns = campaigns?.filter(
    (c) => c.status === 'ACTIVE' || c.status === 'WARMUP' || c.status === 'PENDING_REVIEW'
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/leads')}
          className="mb-2 hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux Leads
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Ajouter un Lead
        </h1>
        <p className="text-muted-foreground">
          Ajoutez manuellement un lead ayant répondu positivement à une campagne
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-6">Informations du Lead</h2>
          <div className="space-y-6">
            {/* Campaign Selection */}
            <div className="space-y-2">
              <Label htmlFor="campaignId">
                Campagne <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.campaignId}
                onValueChange={(value) => handleChange('campaignId', value)}
              >
                <SelectTrigger id="campaignId" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Sélectionner une campagne" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {activeCampaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campaignId && (
                <p className="text-sm text-red-500">{errors.campaignId}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Jean"
                  className="bg-white/5 border-white/10"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Dupont"
                  className="bg-white/5 border-white/10"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jean.dupont@entreprise.com"
                className="bg-white/5 border-white/10"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  Entreprise <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Acme Corp"
                  className="bg-white/5 border-white/10"
                />
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Poste <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Directeur Marketing"
                  className="bg-white/5 border-white/10"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Optional Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">URL LinkedIn (optionnel)</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/jeandupont"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Taille (optionnel)</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => handleChange('companySize', value)}
                >
                  <SelectTrigger id="companySize" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyIndustry">Secteur (optionnel)</Label>
                <Input
                  id="companyIndustry"
                  value={formData.companyIndustry}
                  onChange={(e) =>
                    handleChange('companyIndustry', e.target.value)
                  }
                  placeholder="Technologie"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation (optionnel)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Paris, France"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Lead Status & Quality */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut du Lead</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleChange('status', value as LeadStatus)
                  }
                >
                  <SelectTrigger id="status" className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="CONTACTED">Contacté</SelectItem>
                    <SelectItem value="OPENED">Ouvert</SelectItem>
                    <SelectItem value="REPLIED">Répondu</SelectItem>
                    <SelectItem value="INTERESTED">Intéressé</SelectItem>
                    <SelectItem value="QUALIFIED">Qualifié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select
                  value={formData.sentiment}
                  onValueChange={(value) =>
                    handleChange('sentiment', value as Sentiment)
                  }
                >
                  <SelectTrigger id="sentiment" className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="POSITIVE">Positif</SelectItem>
                    <SelectItem value="NEUTRAL">Neutre</SelectItem>
                    <SelectItem value="NEGATIVE">Négatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityScore">
                  Score qualité (0-100)
                </Label>
                <Input
                  id="qualityScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityScore || ''}
                  onChange={(e) =>
                    handleChange(
                      'qualityScore',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="75"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Response Content */}
            <div className="space-y-2">
              <Label htmlFor="responseContent">
                Contenu de la réponse (optionnel)
              </Label>
              <Textarea
                id="responseContent"
                value={formData.responseContent}
                onChange={(e) =>
                  handleChange('responseContent', e.target.value)
                }
                placeholder="Collez ici la réponse email du lead..."
                rows={6}
                className="bg-white/5 border-white/10"
              />
              <p className="text-sm text-muted-foreground">
                Sera enregistré comme interaction EMAIL_REPLIED
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createLead.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                {createLead.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer le Lead
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/leads')}
                disabled={createLead.isPending}
                className="border-white/10 hover:bg-white/5"
              >
                Annuler
              </Button>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
