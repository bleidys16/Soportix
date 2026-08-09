export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  is_active: boolean;
  ticket_count: number;
}

export interface UserProfile {
  id: number;
  user: number;
  role: 'admin' | 'agent' | 'user';
}
