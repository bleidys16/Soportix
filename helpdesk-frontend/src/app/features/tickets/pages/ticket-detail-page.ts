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
import { CannedResponseService } from '../../../core/services/canned-response.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket';
import { Comment } from '../../../core/models/comment';
import { CannedResponse } from '../../../core/models/canned-response';
import { Attachment } from '../../../core/models/attachment';
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

    /* Chat / Comments Card */
    .comments-card { padding: 0 !important; overflow: hidden; }
    .chat-header { padding: 1rem 1.25rem 0.75rem; border-bottom: 1px solid var(--sx-border); }
    .chat-header h2 { margin: 0; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); display: flex; align-items: center; gap: 8px; }
    .chat-count { background: var(--sx-page-bg); color: var(--sx-text-secondary); font-size: 0.75rem; font-weight: 400; padding: 2px 8px; border-radius: 10px; }

    .chat-messages { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 14px; max-height: 420px; overflow-y: auto; scroll-behavior: smooth; }

    .chat-row { display: flex; align-items: flex-end; gap: 8px; }
    .chat-row.is-mine { flex-direction: row-reverse; }

    .bubble-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; font-weight: 600; color: #fff; flex-shrink: 0; background: var(--sx-grand-rapids); }
    .bubble-avatar.avatar-agent { background: var(--sx-incubi-darkness); }
    .bubble-avatar.avatar-mine { background: var(--sx-reef-waters); }

    .bubble-wrap { max-width: 72%; display: flex; flex-direction: column; gap: 3px; }
    .chat-row.is-mine .bubble-wrap { align-items: flex-end; }

    .bubble-meta-top { display: flex; align-items: center; gap: 6px; padding: 0 4px; }
    .bubble-meta-top strong { font-size: 0.8125rem; font-weight: 500; color: var(--sx-text-primary); }
    .role-chip { font-size: 0.6875rem; color: var(--sx-text-secondary); background: var(--sx-page-bg); border: 1px solid var(--sx-border); padding: 1px 8px; border-radius: 10px; }

    .bubble { padding: 10px 14px; border-radius: 18px; font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
    .bubble-mine { background: var(--sx-grand-rapids); color: #fff; border-bottom-right-radius: 4px; }
    .bubble-other { background: var(--sx-page-bg); color: var(--sx-text-primary); border: 1px solid var(--sx-border); border-bottom-left-radius: 4px; }
    .bubble-other.agent-bubble { background: #f0edfb; border-color: #d4cef0; }

    .bubble-date { font-size: 0.6875rem; color: var(--sx-text-muted); padding: 0 4px; }

    .empty-chat { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 2rem; color: var(--sx-text-muted); text-align: center; }
    .empty-chat mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .empty-chat p { margin: 0; font-size: 0.875rem; }

    .canned-select { padding: 0 1.25rem 0.75rem; }

    .chat-input-area { padding: 0.75rem 1.25rem; border-top: 1px solid var(--sx-border); display: flex; align-items: flex-end; gap: 10px; background: var(--sx-card-bg); }
    .chat-input-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--sx-reef-waters); color: #fff; font-size: 0.6875rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-bottom: 2px; }
    .chat-input-field { flex: 1; display: flex; align-items: flex-end; gap: 8px; background: var(--sx-page-bg); border: 1px solid var(--sx-border); border-radius: 22px; padding: 8px 8px 8px 16px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .chat-input-field:focus-within { border-color: var(--sx-grand-rapids); box-shadow: 0 0 0 3px rgba(77,47,178,0.1); }
    .chat-textarea { flex: 1; border: none; outline: none; background: transparent; resize: none; font-size: 0.875rem; color: var(--sx-text-primary); font-family: inherit; max-height: 120px; overflow-y: auto; line-height: 1.5; }
    .chat-textarea::placeholder { color: var(--sx-text-muted); }
    .send-fab { background: var(--sx-grand-rapids); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; min-width: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s ease, transform 0.15s ease; }
    .send-fab mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .send-fab:hover:not(:disabled) { background: var(--sx-incubi-darkness); transform: scale(1.05); }
    .send-fab:disabled { background: var(--sx-border); color: var(--sx-text-muted); cursor: not-allowed; }

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
    .resolve-btn { margin-top: -0.5rem; margin-bottom: 0.75rem; width: 100%; border-radius: var(--sx-radius-control); background: #16a34a !important; color: #fff !important; }

    .csat-card h3 { margin: 0 0 0.5rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .csat-hint { margin: 0 0 0.75rem; font-size: 0.8125rem; color: var(--sx-text-secondary); }
    .csat-stars { display: flex; gap: 4px; margin-bottom: 0.75rem; }
    .csat-star { background: none; border: none; padding: 0; cursor: pointer; color: var(--sx-text-muted); line-height: 1; }
    .csat-star mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .csat-star.filled { color: #f59e0b; }
    .csat-submit-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); width: 100%; }
    .csat-done { display: flex; align-items: center; gap: 8px; color: var(--sx-text-secondary); font-size: 0.875rem; }
    .csat-done .csat-star mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .csat-done .csat-star { pointer-events: none; }

    .attachments-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--sx-border); }
    .attachments-section h3 { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--sx-text-primary); }
    .attachment-list { list-style: none; margin: 0 0 0.75rem; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .attachment-item { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
    .attachment-item a { color: var(--sx-primary); text-decoration: none; display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .attachment-item a:hover { text-decoration: underline; }
    .attachment-item mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .attachment-item .delete-attachment-btn { width: 28px; height: 28px; line-height: 28px; flex-shrink: 0; }
    .attachment-item .delete-attachment-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .attach-btn { border-radius: var(--sx-radius-control); }
    .attachment-error { color: var(--mat-sys-error, #b3261e); font-size: 0.8125rem; margin: 0.375rem 0 0; }

    .spinner { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class TicketDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private commentService = inject(CommentService);
  private cannedResponseService = inject(CannedResponseService);
  private attachmentService = inject(AttachmentService);

  protected auth = inject(AuthService);
  ticket = signal<Ticket | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  newCommentBody = '';
  statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  cannedResponses = signal<CannedResponse[]>([]);

  attachments = signal<Attachment[]>([]);
  uploadingFile = signal(false);
  attachmentError: string | null = null;

  closingTicket = signal(false);
  userResolveMode = signal(false);
  resolutionNotes = '';
  closeError: string | null = null;

  selectedRating = signal(0);
  hoverRating = signal(0);
  csatComment = '';
  csatError: string | null = null;
  csatSubmitting = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getById(id).subscribe((t) => {
      this.ticket.set(t);
      this.attachments.set(t.attachments ?? []);
      this.loading.set(false);
    });
    this.commentService.getAll(id).subscribe((cs) => this.comments.set(cs));

    if (this.auth.getUserRole() === 'agent' || this.auth.getUserRole() === 'admin') {
      this.cannedResponseService.getAll().subscribe((rs) => this.cannedResponses.set(rs));
    }
  }

  insertCannedResponse(response: CannedResponse) {
    this.newCommentBody = this.newCommentBody.trim()
      ? `${this.newCommentBody}\n${response.body}`
      : response.body;
  }

  onFileSelected(event: Event) {
    const t = this.ticket();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!t || !file) return;

    this.attachmentError = null;
    this.uploadingFile.set(true);
    this.attachmentService.upload(t.id, file).subscribe({
      next: (a) => {
        this.attachments.update((list) => [...list, a]);
        this.uploadingFile.set(false);
        input.value = '';
      },
      error: (err) => {
        this.attachmentError = err?.error?.file?.[0] || 'No se pudo subir el archivo.';
        this.uploadingFile.set(false);
        input.value = '';
      },
    });
  }

  deleteAttachment(a: Attachment) {
    const t = this.ticket();
    if (!t) return;
    this.attachmentService.delete(t.id, a.id).subscribe(() => {
      this.attachments.update((list) => list.filter((x) => x.id !== a.id));
    });
  }

  submitRating() {
    const t = this.ticket();
    if (!t || this.selectedRating() < 1) return;

    this.csatError = null;
    this.csatSubmitting.set(true);
    this.ticketService
      .update(t.id, { csat_rating: this.selectedRating(), csat_comment: this.csatComment.trim() || null })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.csatSubmitting.set(false);
        },
        error: () => {
          this.csatError = 'No se pudo enviar tu calificación. Intenta nuevamente.';
          this.csatSubmitting.set(false);
        },
      });
  }

  changeStatus(status: TicketStatus) {
    const t = this.ticket();
    if (!t) return;

    this.userResolveMode.set(false);

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

  markAsResolved() {
    this.resolutionNotes = '';
    this.closeError = null;
    this.userResolveMode.set(true);
    this.closingTicket.set(true);
  }

  confirmClose() {
    const t = this.ticket();
    if (!t) return;

    this.closeError = null;
    const notes = this.resolutionNotes.trim()
      ? this.resolutionNotes.trim()
      : 'El solicitante confirmó que su problema fue resuelto.';

    this.ticketService.update(t.id, { status: 'closed', resolution_notes: notes }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.closingTicket.set(false);
        this.userResolveMode.set(false);
      },
      error: () => {
        this.closeError = 'No se pudo cerrar el ticket. Intenta nuevamente.';
      },
    });
  }

  cancelClose() {
    this.closingTicket.set(false);
    this.userResolveMode.set(false);
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

  onChatKeydown(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.key === 'Enter' && !ke.shiftKey) {
      ke.preventDefault();
      this.addComment();
    }
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
