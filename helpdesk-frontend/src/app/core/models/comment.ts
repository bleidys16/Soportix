export interface Comment {
  id: number;
  ticket: number;
  author: number;
  author_username?: string;
  author_role?: string;
  body: string;
  created_at: string;
}
