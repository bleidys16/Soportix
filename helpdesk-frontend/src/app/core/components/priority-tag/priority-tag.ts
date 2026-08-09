import { Component, Input } from '@angular/core';
import { TicketPriority } from '../../models/ticket';

const LABELS: Record<TicketPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

@Component({
  selector: 'app-priority-tag',
  standalone: true,
  template: `<span class="sx-badge sx-priority-{{ priority }}">{{ LABELS[priority] }}</span>`,
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
    .sx-priority-low { background: var(--sx-priority-low-bg); color: var(--sx-priority-low-fg); }
    .sx-priority-medium { background: var(--sx-priority-medium-bg); color: var(--sx-priority-medium-fg); }
    .sx-priority-high { background: var(--sx-priority-high-bg); color: var(--sx-priority-high-fg); }
  `],
})
export class PriorityTagComponent {
  @Input({ required: true }) priority!: TicketPriority;
  protected readonly LABELS = LABELS;
}
