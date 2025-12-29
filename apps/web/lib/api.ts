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
      // Unauthorized - clear user data and redirect to login
      // Cookie will be cleared by backend or expired automatically
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Types ==========

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
  getAll: () => api.get<Campaign[]>('/campaigns').then((res) => res.data),

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
  plan: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    campaigns: number;
    payments: number;
  };
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
  pricePerLead: number;
  maxLeads?: number;
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

  getAllUsers: () => api.get<AdminUser[]>('/admin/users').then((res) => res.data),

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
    api.get<AdminCampaign[]>('/admin/campaigns').then((res) => res.data),

  getCampaign: (id: string) =>
    api.get<AdminCampaign>(`/admin/campaigns/${id}`).then((res) => res.data),

  updateCampaign: (id: string, data: UpdateCampaignDto) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}`, data).then((res) => res.data),

  approveCampaign: (id: string) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}/approve`).then((res) => res.data),

  rejectCampaign: (id: string, reason?: string) =>
    api.patch<{ message: string; campaign: AdminCampaign }>(`/admin/campaigns/${id}/reject`, { reason }).then((res) => res.data),

  // Lead management
  getAllLeads: () =>
    api.get<Lead[]>('/admin/leads').then((res) => res.data),

  getLead: (id: string) =>
    api.get<Lead>(`/admin/leads/${id}`).then((res) => res.data),

  createLead: (data: CreateLeadDto) =>
    api.post<{ message: string; lead: Lead }>('/admin/leads', data).then((res) => res.data),

  updateLead: (id: string, data: UpdateLeadDto) =>
    api.patch<{ message: string; lead: Lead }>(`/admin/leads/${id}`, data).then((res) => res.data),

  deleteLead: (id: string) =>
    api.delete<{ message: string }>(`/admin/leads/${id}`).then((res) => res.data),
};

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

export const leadsApi = {
  getAll: () => api.get<Lead[]>('/leads').then((res) => res.data),

  getOne: (id: string) =>
    api.get<Lead>(`/leads/${id}`).then((res) => res.data),

  unlock: (id: string) =>
    api.post<{ message: string; lead: Lead; amountPaid: number }>(`/leads/${id}/unlock`).then((res) => res.data),
};
