
export interface UserInvitation {
  id: string;
  email: string;
  role: 'admin' | 'accountant' | 'client';
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string | null;
  invited_by_name: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  email: string;
  role: 'admin' | 'accountant' | 'client';
  token: string;
  expires_at: string;
  invited_by: string;
  invited_by_name: string;
}

export interface UpdateInvitationData {
  status: 'pending' | 'accepted' | 'expired';
  accepted_at?: string;
}
