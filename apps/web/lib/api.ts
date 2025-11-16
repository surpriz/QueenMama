import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
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

export const adminApi = {
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
};
