'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, CreateRechargeDto } from '@/lib/api';

// Stale time constants (in milliseconds)
const STALE_TIME = {
  CREDITS: 30 * 1000, // 30 seconds - credits should be fresh
};

/**
 * Hook to fetch campaign credits balance
 * @param campaignId - Campaign ID
 */
export function useCampaignCredits(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['payments', 'credits', campaignId],
    queryFn: () => paymentsApi.getCampaignCredits(campaignId!),
    enabled: !!campaignId,
    staleTime: STALE_TIME.CREDITS,
  });
}

/**
 * Hook to create a credit recharge checkout session
 * On success, redirects user to Stripe Checkout
 */
export function useCreateRecharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: CreateRechargeDto }) =>
      paymentsApi.createRecharge(campaignId, data),
    onSuccess: (response) => {
      // Redirect to Stripe Checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    },
    onError: (error) => {
      console.error('Failed to create recharge:', error);
    },
  });
}

/**
 * Helper hook to invalidate credits cache after payment
 * Can be called from success page
 */
export function useInvalidateCredits() {
  const queryClient = useQueryClient();

  return (campaignId?: string) => {
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['payments', 'credits', campaignId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['payments', 'credits'] });
    }
    // Also invalidate leads as credits may affect what can be unlocked
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };
}
