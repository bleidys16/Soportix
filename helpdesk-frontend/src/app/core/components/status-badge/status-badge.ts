import { Component, Input } from '@angular/core';
import { TicketStatus } from '../../models/ticket';

const LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  closed: 'Cerrado',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="sx-badge sx-status-{{ status }}">{{ LABELS[status] }}</span>`,
  styles: [`
    .sx-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .sx-status-open { background: var(--sx-status-open-bg); color: var(--sx-status-open-fg); }
    .sx-status-in_progress { background: var(--sx-status-progress-bg); color: var(--sx-status-progress-fg); }
    .sx-status-closed { background: var(--sx-status-closed-bg); color: var(--sx-status-closed-fg); }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TicketStatus;
  protected readonly LABELS = LABELS;
}
