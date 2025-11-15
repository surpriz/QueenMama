'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, CreateCampaignDto, UpdateCampaignDto } from '@/lib/api';

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...campaignKeys.lists(), { filters }] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  stats: (id: string) => [...campaignKeys.detail(id), 'stats'] as const,
};

// Get all campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: () => campaignsApi.getAll(),
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.getOne(id),
    enabled: !!id,
  });
}

// Get campaign stats
export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: campaignKeys.stats(id),
    queryFn: () => campaignsApi.getStats(id),
    enabled: !!id,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignDto) => campaignsApi.create(data),
    onSuccess: () => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) =>
      campaignsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific campaign and lists
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
