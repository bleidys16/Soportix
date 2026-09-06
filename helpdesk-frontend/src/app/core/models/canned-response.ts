export interface CannedResponse {
  id: number;
  title: string;
  body: string;
  created_by?: number | null;
  created_by_username?: string | null;
  created_at: string;
}
