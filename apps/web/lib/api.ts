import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're on auth pages (login, register, verify-email)
      // Otherwise, the error message won't be displayed
      const isAuthPage = typeof window !== 'undefined' && (
        window.location.pathname === '/login' ||
        window.location.pathname === '/register' ||
        window.location.pathname.startsWith('/verify-email')
      );

      if (!isAuthPage) {
        // Unauthorized on protected page - clear user data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== Types ==========

export enum DepositStatus {
  PENDING = 'PENDING',
  CHECKOUT_CREATED = 'CHECKOUT_CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface Campaign {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  targetCriteria: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
    [key: string]: any;
  };
  budget: number;
  pricePerLead: number;
  maxLeads?: number;
  // Deposit & Credits
  depositStatus: DepositStatus;
  depositPaidAt?: string;
  creditBalance: number;
  // Stats
  totalContacted: number;
  totalReplies: number;
  totalQualified: number;
  totalPaid: number;
  emailSequences?: EmailSequence[];
  leads?: Lead[];
  _count?: {
    leads: number;
  };
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  WARMUP = 'WARMUP',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface EmailSequence {
  id: string;
  campaignId: string;
  step: number;
  subject: string;
  body: string;
  delayDays: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

export interface Lead {
  id: string;
  campaignId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  phone?: string;
  companySize?: string;
  companyIndustry?: string;
  location?: string;
  status: LeadStatus;
  qualityScore?: number;
  sentiment?: Sentiment;
  isRevealed: boolean;
  revealedAt?: string;
  paidAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export enum LeadStatus {
  CONTACTED = 'CONTACTED',
  OPENED = 'OPENED',
  REPLIED = 'REPLIED',
  INTERESTED = 'INTERESTED',
  QUALIFIED = 'QUALIFIED',
  PAID = 'PAID',
  NOT_INTERESTED = 'NOT_INTERESTED',
  BOUNCED = 'BOUNCED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  targetCriteria: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
  };
  budget: number;
  maxLeads?: number;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  targetCriteria?: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
  };
  budget?: number;
  maxLeads?: number;
}

export interface CampaignStats {
  id: string;
  name: string;
  status: CampaignStatus;
  totalContacted: number;
  totalReplies: number;
  totalQualified: number;
  totalPaid: number;
  replyRate: number;
  qualificationRate: number;
  budget: number;
  spent: number;
  remaining: number;
}

export interface DashboardStats {
  totalCampaigns: number;
  totalCampaignsGrowth: string;
  activeLeads: number;
  activeLeadsGrowth: string;
  qualifiedLeads: number;
  qualifiedLeadsGrowth: string;
  revenue: number;
  revenueGrowth: string;
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    leads: number;
    qualified: number;
  }>;
}

// ========== API Functions ==========

// Campaigns
export const campaignsApi = {
  getAll: () => api.get<{ data: Campaign[]; meta: any }>('/campaigns').then((res) => res.data.data),

  getOne: (id: string) =>
    api.get<Campaign>(`/campaigns/${id}`).then((res) => res.data),

  create: (data: CreateCampaignDto) =>
    api.post<Campaign>('/campaigns', data).then((res) => res.data),

  update: (id: string, data: UpdateCampaignDto) =>
    api.patch<Campaign>(`/campaigns/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/campaigns/${id}`).then((res) => res.data),

  getStats: (id: string) =>
    api.get<CampaignStats>(`/campaigns/${id}/stats`).then((res) => res.data),

  getDashboardStats: () =>
    api.get<DashboardStats>('/campaigns/dashboard-stats').then((res) => res.data),
};

// Admin
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  admins: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    campaigns: number;
    payments: number;
  };
}

// Market difficulty enum
export enum MarketDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
}

// Pricing analysis types
export interface PricingAnalysis {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  recommendation: 'GO' | 'GO_WITH_CAUTION' | 'NO_GO';
  reason: string;
  estimatedLeadsPerMonth: { min: number; max: number };
  estimatedRevenuePerMonth: { min: number; max: number };
  input: {
    estimatedTam: number;
    marketDifficulty: MarketDifficulty;
  };
}

export interface UpdateCampaignPricingDto {
  estimatedTam: number;
  marketDifficulty: MarketDifficulty;
  pricePerLead: number;
  adminNotes?: string;
}

export interface AdminCampaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  targetCriteria: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
    [key: string]: any;
  };
  budget: number;
  pricePerLead: number | null;
  maxLeads?: number;
  // Pricing analysis fields
  estimatedTam?: number | null;
  marketDifficulty?: MarketDifficulty | null;
  adminNotes?: string | null;
  priceApprovedAt?: string | null;
  priceApprovedBy?: string | null;
  // Stats
  totalContacted: number;
  totalReplies: number;
  totalQualified: number;
  totalPaid: number;
  emailSequences?: EmailSequence[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  customer: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  _count: {
    leads: number;
    emailSequences: number;
  };
}

export const adminApi = {
  // User management
  getStats: () => api.get<AdminStats>('/admin/stats').then((res) => res.data),

  getAllUsers: () => api.get<{ data: AdminUser[]; meta: any }>('/admin/users').then((res) => res.data.data),

  getUser: (id: string) =>
    api.get<AdminUser>(`/admin/users/${id}`).then((res) => res.data),

  blockUser: (id: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/admin/users/${id}/block`).then((res) => res.data),

  unblockUser: (id: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/admin/users/${id}/unblock`).then((res) => res.data),

  demoteUser: (id: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/admin/users/${id}/demote`).then((res) => res.data),

  promoteUser: (id: string) =>
    api.patch<{ message: string; user: AdminUser }>(`/admin/users/${id}/promote`).then((res) => res.data),

  deleteUser: (id: string) =>
    api.delete<{ message: string }>(`/admin/users/${id}`).then((res) => res.data),

  // Campaign management
  getAllCampaigns: () =>
    api.get<{ data: AdminCampaign[]; meta: any }>('/admin/campaigns').then((res) => res.data.data),

  getCampaign: (id: string) =>
    api.get<AdminCampaign>(`/admin/campaigns/${id}`).then((res) => res.data),

  updateCampaign: (id: string, data: UpdateCampaignDto) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}`, data).then((res) => res.data),

  approveCampaign: (id: string) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}/approve`).then((res) => res.data),

  rejectCampaign: (id: string, reason?: string) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}/reject`, { reason }).then((res) => res.data),

  // Pricing management
  analyzePricing: (data: { estimatedTam: number; marketDifficulty: MarketDifficulty }) =>
    api.post<PricingAnalysis>('/admin/campaigns/analyze-pricing', data).then((res) => res.data),

  updateCampaignPricing: (id: string, data: UpdateCampaignPricingDto) =>
    api.patch<{ message: string; campaign: AdminCampaign; analysis: PricingAnalysis; warning?: string }>(`/admin/campaigns/${id}/pricing`, data).then((res) => res.data),

  getCampaignsPendingPricing: () =>
    api.get<{ count: number; campaigns: AdminCampaign[] }>('/admin/campaigns/pending-pricing').then((res) => res.data),

  // Lead management
  getAllLeads: () =>
    api.get<{ data: Lead[]; meta: any }>('/admin/leads').then((res) => res.data.data),

  getLead: (id: string) =>
    api.get<Lead>(`/admin/leads/${id}`).then((res) => res.data),

  createLead: (data: CreateLeadDto) =>
    api.post<{ message: string; lead: Lead }>('/admin/leads', data).then((res) => res.data),

  updateLead: (id: string, data: UpdateLeadDto) =>
    api.patch<{ message: string; lead: Lead }>(`/admin/leads/${id}`, data).then((res) => res.data),

  deleteLead: (id: string) =>
    api.delete<{ message: string }>(`/admin/leads/${id}`).then((res) => res.data),

  // SES Monitoring
  getSesMetrics: () =>
    api.get<SESMetrics>('/admin/ses-metrics').then((res) => res.data),

  // Advanced Statistics
  getRevenueStats: (period: 'weekly' | 'monthly' = 'monthly') =>
    api.get<RevenueStats>(`/admin/stats/revenue?period=${period}`).then((res) => res.data),

  getLeadFunnelStats: () =>
    api.get<LeadFunnelStats>('/admin/stats/lead-funnel').then((res) => res.data),

  getCampaignDistribution: () =>
    api.get<CampaignDistribution>('/admin/stats/campaign-distribution').then((res) => res.data),

  getRecentActivity: (limit: number = 10) =>
    api.get<ActivityItem[]>(`/admin/activity?limit=${limit}`).then((res) => res.data),
};

// SES Monitoring Types
export interface SESMetrics {
  status: 'healthy' | 'warning' | 'critical';
  region: string;
  sendVolume: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  deliverabilityMetrics: {
    deliveryRate: number;
    bounceRate: number;
    complaintRate: number;
  };
  quotas: {
    maxSendRate: number;
    dailyQuota: number;
    sentLast24Hours: number;
    quotaUsagePercent: number;
  };
  identities: Array<{
    identity: string;
    type: 'Domain' | 'Email';
    status: 'Verified' | 'Pending' | 'Failed';
    dkimVerified: boolean;
  }>;
  lastUpdated: string;
}

// Revenue Stats Types
export interface RevenueDataPoint {
  period: string;
  revenue: number;
  leadsCount: number;
}

export interface RevenueStats {
  data: RevenueDataPoint[];
  total: number;
  growth: number;
  periodType: 'weekly' | 'monthly';
}

// Lead Funnel Types
export interface LeadFunnelStats {
  contacted: number;
  opened: number;
  replied: number;
  interested: number;
  qualified: number;
  paid: number;
  conversionRates: {
    openRate: number;
    replyRate: number;
    interestRate: number;
    qualificationRate: number;
    paymentRate: number;
  };
}

// Campaign Distribution Types
export interface CampaignDistributionItem {
  status: CampaignStatus;
  count: number;
  label: string;
  color: string;
}

export type CampaignDistribution = CampaignDistributionItem[];

// Activity Types
export type ActivityType = 'campaign_created' | 'campaign_approved' | 'campaign_rejected' | 'lead_qualified' | 'lead_paid' | 'payment_received';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata: {
    entityId: string;
    entityName?: string;
    amount?: number;
    customerEmail?: string;
    [key: string]: any;
  };
}

// Leads (customer)
export interface CreateLeadDto {
  campaignId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  phone?: string;
  companySize?: string;
  companyIndustry?: string;
  location?: string;
  status?: LeadStatus;
  qualityScore?: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  responseContent?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

// Lead unlock response types
export interface RechargeOption {
  leads: number;
  total: number;
  label: string;
}

export interface LeadUnlockSuccess {
  requiresPayment: false;
  message: string;
  lead: Lead;
  amountPaid: number;
  remainingCredits: number;
}

export interface LeadUnlockRequiresPayment {
  requiresPayment: true;
  message: string;
  leadId: string;
  campaignId: string;
  pricePerLead: number;
  rechargeOptions: RechargeOption[];
}

export type LeadUnlockResponse = LeadUnlockSuccess | LeadUnlockRequiresPayment;

export const leadsApi = {
  getAll: () => api.get<{ data: Lead[]; meta: any }>('/leads').then((res) => res.data.data),

  getOne: (id: string) =>
    api.get<Lead>(`/leads/${id}`).then((res) => res.data),

  unlock: (id: string) =>
    api.post<LeadUnlockResponse>(`/leads/${id}/unlock`).then((res) => res.data),
};

// ========== Payments API ==========

export interface CampaignCredits {
  balance: number;
  used: number;
  depositStatus: DepositStatus;
  pricePerLead: number;
}

export interface CreateRechargeDto {
  leadCount: 5 | 10;
  pendingLeadId?: string;
}

export const paymentsApi = {
  // Get campaign credits balance
  getCampaignCredits: (campaignId: string) =>
    api.get<CampaignCredits>(`/payments/campaigns/${campaignId}/credits`).then((res) => res.data),

  // Create recharge checkout
  createRecharge: (campaignId: string, data: CreateRechargeDto) =>
    api.post<{ checkoutUrl: string }>(`/payments/campaigns/${campaignId}/recharge`, data).then((res) => res.data),
};
