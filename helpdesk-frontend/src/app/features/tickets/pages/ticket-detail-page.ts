import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../../core/services/ticket.service';
import { CommentService } from '../../../core/services/comment.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket';
import { Comment } from '../../../core/models/comment';
import { AuthService } from '../../../core/auth/auth';
import { StatusBadgeComponent } from '../../../core/components/status-badge/status-badge';
import { PriorityTagComponent } from '../../../core/components/priority-tag/priority-tag';

@Component({
  selector: 'app-ticket-detail-page',
  standalone: true,
  imports: [
    DatePipe, FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule,
    MatProgressSpinnerModule, StatusBadgeComponent, PriorityTagComponent,
  ],
  templateUrl: './ticket-detail-page.html',
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; }
    .back-link { margin-bottom: 1rem; }
    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }
    .detail-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }
    @media (max-width: 800px) { .detail-grid { grid-template-columns: 1fr; } }
    .main-column, .side-column { display: flex; flex-direction: column; gap: 1.25rem; }

    .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .ticket-header h1 { margin: 0; font-size: 1.25rem; font-weight: 500; color: var(--sx-text-primary); }
    .description { white-space: pre-wrap; color: var(--sx-text-primary); line-height: 1.6; margin: 0; }

    .resolution-card { margin-top: 1rem; padding: 1rem; background: var(--sx-status-open-bg); border-radius: 10px; }
    .resolution-card h3 { display: flex; align-items: center; gap: 0.375rem; margin: 0 0 0.5rem; color: var(--sx-status-open-fg); font-size: 1rem; }
    .resolution-card p { margin: 0; white-space: pre-wrap; color: var(--sx-text-primary); }

    .comments-card h2 { margin: 0 0 1rem; font-size: 1rem; font-weight: 500; color: var(--sx-text-primary); }
    .comment { display: flex; gap: 10px; padding: 0.75rem 0; border-top: 1px solid var(--sx-border); }
    .comment:first-of-type { border-top: none; padding-top: 0; }
    .comment-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--sx-primary); color: #fff; font-size: 0.6875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .comment-body-wrap { flex: 1; min-width: 0; }
    .comment-header { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; margin-bottom: 4px; flex-wrap: wrap; }
    .comment-header strong { color: var(--sx-text-primary); }
    .role-chip { font-size: 0.6875rem; color: var(--sx-text-secondary); background: var(--sx-page-bg); padding: 1px 8px; border-radius: 10px; }
    .comment-date { color: var(--sx-text-muted); margin-left: auto; }
    .comment-body { white-space: pre-wrap; color: var(--sx-text-primary); font-size: 0.875rem; }
    .empty-hint { color: var(--sx-text-muted); font-size: 0.875rem; }

    .new-comment { display: flex; gap: 0.5rem; align-items: flex-start; margin-top: 1rem; }
    .new-comment mat-form-field { flex: 1; }
    .send-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }

    .details-card h3 { margin: 0 0 1rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .details-card .full-width { width: 100%; margin-bottom: 0.75rem; }
    .close-ticket-form { margin-top: -0.25rem; margin-bottom: 0.75rem; padding: 0.875rem; background: var(--sx-page-bg); border-radius: 10px; }
    .close-ticket-form .full-width { width: 100%; }
    .close-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .error-message { color: var(--mat-sys-error, #b3261e); font-size: 0.8125rem; margin: 0.5rem 0 0; }

    .detail-list { margin: 0; }
    .detail-list > div { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0; border-top: 1px solid var(--sx-border); font-size: 0.8125rem; }
    .detail-list > div:first-child { border-top: none; }
    .detail-list dt { color: var(--sx-text-secondary); margin: 0; }
    .detail-list dd { color: var(--sx-text-primary); margin: 0; text-align: right; }
    .assign-btn { margin-top: -0.5rem; margin-bottom: 0.75rem; width: 100%; border-radius: var(--sx-radius-control); }

    .spinner { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class TicketDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private commentService = inject(CommentService);

  protected auth = inject(AuthService);
  ticket = signal<Ticket | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  newCommentBody = '';
  statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];

  closingTicket = signal(false);
  resolutionNotes = '';
  closeError: string | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getById(id).subscribe((t) => {
      this.ticket.set(t);
      this.loading.set(false);
    });
    this.commentService.getAll(id).subscribe((cs) => this.comments.set(cs));
  }

  changeStatus(status: TicketStatus) {
    const t = this.ticket();
    if (!t) return;

    if (status === 'closed') {
      this.resolutionNotes = t.resolution_notes ?? '';
      this.closeError = null;
      this.closingTicket.set(true);
      return;
    }

    this.ticketService.update(t.id, { status }).subscribe((updated) => {
      this.ticket.set(updated);
    });
  }

  confirmClose() {
    const t = this.ticket();
    if (!t || !this.resolutionNotes.trim()) return;

    this.closeError = null;
    this.ticketService.update(t.id, { status: 'closed', resolution_notes: this.resolutionNotes }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.closingTicket.set(false);
      },
      error: () => {
        this.closeError = 'No se pudo cerrar el ticket. Intenta nuevamente.';
      },
    });
  }

  cancelClose() {
    this.closingTicket.set(false);
    this.closeError = null;
  }

  assignToMe() {
    const t = this.ticket();
    const userId = this.auth.getUserId();
    if (!t || !userId) return;
    this.ticketService.update(t.id, { assigned_to: userId }).subscribe((updated) => {
      this.ticket.set(updated);
    });
  }

  addComment() {
    const t = this.ticket();
    if (!t || !this.newCommentBody.trim()) return;
    this.commentService.create(t.id, { body: this.newCommentBody }).subscribe((c) => {
      this.comments.update((cs) => [...cs, c]);
      this.newCommentBody = '';
    });
  }

  protected readonly statusLabel: Record<TicketStatus, string> = {
    open: 'Abierto',
    in_progress: 'En Proceso',
    closed: 'Cerrado',
  };

  protected readonly roleLabel: Record<string, string> = {
    user: 'Usuario final',
    agent: 'Agente de soporte',
    admin: 'Administrador',
  };
}
