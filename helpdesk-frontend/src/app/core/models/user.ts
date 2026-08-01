export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}

export interface UserProfile {
  id: number;
  user: number;
  role: 'admin' | 'agent' | 'user';
}
