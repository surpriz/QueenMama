'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useCreateCampaign } from '@/hooks/use-campaigns';
import { CreateCampaignDto } from '@/lib/api';

// Validation schema
const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  industries: z.string().optional(),
  companySize: z.string().optional(),
  locations: z.string().optional(),
  titles: z.string().optional(),
  budget: z.number().min(100, 'Budget must be at least €100'),
  maxLeads: z.number().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const createCampaign = useCreateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      industries: '',
      companySize: '',
      locations: '',
      titles: '',
      budget: 1000,
      maxLeads: 100,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      // Transform form data to API format
      const campaignData: CreateCampaignDto = {
        name: data.name,
        description: data.description,
        targetCriteria: {
          industries: data.industries
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          companySize: data.companySize
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          locations: data.locations
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          titles: data.titles
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        budget: data.budget,
        maxLeads: data.maxLeads,
      };

      await createCampaign.mutateAsync(campaignData);
      router.push('/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/campaigns')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
            <p className="text-muted-foreground">
              Create a new lead generation campaign
            </p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex items-center flex-1"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Q1 2025 SaaS Outreach"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of your campaign goals"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Target Criteria (ICP) */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Criteria (ICP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="industries">Industries</Label>
                  <Input
                    id="industries"
                    {...register('industries')}
                    placeholder="e.g., Software, SaaS, Fintech (comma-separated)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter industries separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Input
                    id="companySize"
                    {...register('companySize')}
                    placeholder="e.g., 10-50, 51-200 (comma-separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locations">Locations</Label>
                  <Input
                    id="locations"
                    {...register('locations')}
                    placeholder="e.g., France, Germany, UK (comma-separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titles">Job Titles</Label>
                  <Input
                    id="titles"
                    {...register('titles')}
                    placeholder="e.g., CEO, CTO, Head of Sales (comma-separated)"
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Budget & Configuration */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Budget & Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Campaign Budget (€) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    {...register('budget', { valueAsNumber: true })}
                    placeholder="1000"
                  />
                  {errors.budget && (
                    <p className="text-sm text-red-500">{errors.budget.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Total budget allocated for this campaign
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLeads">Max Leads (Optional)</Label>
                  <Input
                    id="maxLeads"
                    type="number"
                    {...register('maxLeads', { valueAsNumber: true })}
                    placeholder="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of leads to contact
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Campaign Summary</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">{watch('name') || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Budget:</dt>
                      <dd className="font-medium">€{watch('budget') || 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Max Leads:</dt>
                      <dd className="font-medium">{watch('maxLeads') || 'Unlimited'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={createCampaign.isPending}>
                    {createCampaign.isPending ? (
                      'Creating...'
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
