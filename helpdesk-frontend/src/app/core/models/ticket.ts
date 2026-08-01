export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: number;
  created_by_username?: string;
  assigned_to?: number | null;
  assigned_to_username?: string | null;
  category: number;
  category_name?: string;
  created_at: string;
  updated_at: string;
}
