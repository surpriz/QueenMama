import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, UpdateCampaignDto, CreateLeadDto, UpdateLeadDto } from '@/lib/api';

// Get admin statistics
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
  });
}

// Get all users
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers(),
  });
}

// Get single user
export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
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
  });
}

// Get single campaign (admin)
export function useAdminCampaign(id: string) {
  return useQuery({
    queryKey: ['admin', 'campaigns', id],
    queryFn: () => adminApi.getCampaign(id),
    enabled: !!id,
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

// ============= LEAD MANAGEMENT =============

// Get all leads (admin)
export function useAdminLeads() {
  return useQuery({
    queryKey: ['admin', 'leads'],
    queryFn: () => adminApi.getAllLeads(),
  });
}

// Get single lead (admin)
export function useAdminLead(id: string) {
  return useQuery({
    queryKey: ['admin', 'leads', id],
    queryFn: () => adminApi.getLead(id),
    enabled: !!id,
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
