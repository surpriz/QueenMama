import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, UpdateCampaignDto, CreateLeadDto, UpdateLeadDto, UpdateCampaignPricingDto, MarketDifficulty } from '@/lib/api';

// Stale time constants (in milliseconds)
const STALE_TIME = {
  STATS: 2 * 60 * 1000, // 2 minutes
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 5 * 60 * 1000, // 5 minutes
};

// Get admin statistics
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    staleTime: STALE_TIME.STATS,
  });
}

// Get all users
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers(),
    staleTime: STALE_TIME.LIST,
  });
}

// Get single user
export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
  });
}

// Block user
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// Unblock user
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// Demote user
export function useDemoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.demoteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// Promote user
export function usePromoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.promoteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ============= CAMPAIGN MANAGEMENT =============

// Get all campaigns (admin)
export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: () => adminApi.getAllCampaigns(),
    staleTime: STALE_TIME.LIST,
  });
}

// Get single campaign (admin)
export function useAdminCampaign(id: string) {
  return useQuery({
    queryKey: ['admin', 'campaigns', id],
    queryFn: () => adminApi.getCampaign(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
  });
}

// Update campaign (admin)
export function useUpdateAdminCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) =>
      adminApi.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns', variables.id] });
    },
  });
}

// Approve campaign (admin)
export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// Reject campaign (admin)
export function useRejectCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.rejectCampaign(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// ============= PRICING MANAGEMENT =============

// Analyze pricing
export function useAnalyzePricing() {
  return useMutation({
    mutationFn: (data: { estimatedTam: number; marketDifficulty: MarketDifficulty }) =>
      adminApi.analyzePricing(data),
  });
}

// Update campaign pricing
export function useUpdateCampaignPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignPricingDto }) =>
      adminApi.updateCampaignPricing(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns', 'pending-pricing'] });
    },
  });
}

// Get campaigns pending pricing
export function useCampaignsPendingPricing() {
  return useQuery({
    queryKey: ['admin', 'campaigns', 'pending-pricing'],
    queryFn: () => adminApi.getCampaignsPendingPricing(),
    staleTime: STALE_TIME.LIST,
  });
}

// ============= LEAD MANAGEMENT =============

// Get all leads (admin)
export function useAdminLeads() {
  return useQuery({
    queryKey: ['admin', 'leads'],
    queryFn: () => adminApi.getAllLeads(),
    staleTime: STALE_TIME.LIST,
  });
}

// Get single lead (admin)
export function useAdminLead(id: string) {
  return useQuery({
    queryKey: ['admin', 'leads', id],
    queryFn: () => adminApi.getLead(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
  });
}

// Create lead (admin)
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadDto) => adminApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// Update lead (admin)
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) =>
      adminApi.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads', variables.id] });
    },
  });
}

// Delete lead (admin)
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// ============= SES MONITORING =============

// Get SES metrics
export function useSesMetrics() {
  return useQuery({
    queryKey: ['admin', 'ses-metrics'],
    queryFn: () => adminApi.getSesMetrics(),
    staleTime: STALE_TIME.STATS,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}
