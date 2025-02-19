export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'accountant' | 'manager';
  status: 'active' | 'suspended' | 'pending';
  subscriptionTier?: 'free' | 'basic' | 'professional' | 'enterprise';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired';
  practiceId?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Practice {
  id: string;
  name: string;
  ownerId: string;
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }[];
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  maxUsersPerPractice: number;
  maxCompaniesPerUser: number;
  features: {
    multipleCompanies: boolean;
    practiceManagement: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
  };
}
