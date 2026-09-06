export interface Attachment {
  id: number;
  ticket: number;
  file: string;
  file_name: string;
  uploaded_by?: number | null;
  uploaded_by_username?: string | null;
  uploaded_at: string;
}
