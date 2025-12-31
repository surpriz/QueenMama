import { useQuery } from '@tanstack/react-query';
import { adminApi, AdminCampaign } from '@/lib/api';

// Hook for fetching pending campaigns with polling
export function usePendingCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns', 'pending'],
    queryFn: async () => {
      const campaigns = await adminApi.getAllCampaigns();
      return campaigns.filter((c: AdminCampaign) => c.status === 'PENDING_REVIEW');
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });
}

// Hook to get just the count
export function usePendingCampaignsCount() {
  const { data } = usePendingCampaigns();
  return data?.length || 0;
}
