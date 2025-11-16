'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api';

/**
 * Hook to fetch all leads for the current customer
 * Returns leads with masked emails for non-revealed leads
 */
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
  });
}

/**
 * Hook to fetch a single lead by ID
 * @param id - Lead ID
 */
export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getOne(id),
    enabled: !!id,
  });
}

/**
 * Hook to unlock a lead (reveal full contact information)
 * Triggers payment flow and updates lead status to PAID
 */
export function useUnlockLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.unlock(id),
    onSuccess: () => {
      // Invalidate leads list and individual lead queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
