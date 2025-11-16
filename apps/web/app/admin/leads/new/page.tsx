'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewLeadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createLead = useCreateLead();
  const { data: campaigns } = useAdminCampaigns();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

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
    status: 'QUALIFIED',
    qualityScore: 75,
    sentiment: 'POSITIVE',
    responseContent: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

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
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/leads')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
          <p className="text-muted-foreground">
            Manually add a lead that responded positively to an email campaign
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Selection */}
              <div className="space-y-2">
                <Label htmlFor="campaignId">
                  Campaign <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.campaignId}
                  onValueChange={(value) => handleChange('campaignId', value)}
                >
                  <SelectTrigger id="campaignId">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
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
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
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
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Acme Corp"
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500">{errors.company}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Marketing Manager"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
              </div>

              {/* Optional Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size (optional)</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => handleChange('companySize', value)}
                  >
                    <SelectTrigger id="companySize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="companyIndustry">Industry (optional)</Label>
                  <Input
                    id="companyIndustry"
                    value={formData.companyIndustry}
                    onChange={(e) =>
                      handleChange('companyIndustry', e.target.value)
                    }
                    placeholder="Technology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              {/* Lead Status & Quality */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Lead Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange('status', value as LeadStatus)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="OPENED">Opened</SelectItem>
                      <SelectItem value="REPLIED">Replied</SelectItem>
                      <SelectItem value="INTERESTED">Interested</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
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
                    <SelectTrigger id="sentiment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POSITIVE">😊 Positive</SelectItem>
                      <SelectItem value="NEUTRAL">😐 Neutral</SelectItem>
                      <SelectItem value="NEGATIVE">😞 Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualityScore">
                    Quality Score (0-100)
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
                  />
                </div>
              </div>

              {/* Response Content */}
              <div className="space-y-2">
                <Label htmlFor="responseContent">
                  Response Content (optional)
                </Label>
                <Textarea
                  id="responseContent"
                  value={formData.responseContent}
                  onChange={(e) =>
                    handleChange('responseContent', e.target.value)
                  }
                  placeholder="Paste the lead's email response here..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  This will be stored as an EMAIL_REPLIED interaction
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createLead.isPending}
                  className="flex-1"
                >
                  {createLead.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Lead...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Lead
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/leads')}
                  disabled={createLead.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
