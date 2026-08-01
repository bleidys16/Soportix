import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
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

@Component({
  selector: 'app-ticket-detail-page',
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe, FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ticket-detail-page.html',
  styles: [`
    .container { max-width: 900px; margin: 0 auto; }
    .back-link { margin-bottom: 1rem; }
    .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; }
    .ticket-header h1 { margin: 0; }
    .meta { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; color: var(--mat-sys-on-surface-variant); font-size: 0.875rem; }
    .meta-item { display: flex; align-items: center; gap: 0.25rem; }
    .description-card { margin: 1rem 0; white-space: pre-wrap; }
    .comments-section { margin-top: 2rem; }
    .comment { padding: 1rem 0; }
    .comment-header { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.5rem; }
    .comment-body { white-space: pre-wrap; }
    .new-comment { display: flex; gap: 0.5rem; align-items: flex-start; margin-top: 1rem; }
    .new-comment mat-form-field { flex: 1; }
    .status-select { min-width: 180px; }
    .role-actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; flex-wrap: wrap; }
    .chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
    .chip-open { background: #e8f5e9; color: #2e7d32; }
    .chip-in_progress { background: #fff3e0; color: #e65100; }
    .chip-closed { background: #f5f5f5; color: #616161; }
    .chip-low { background: #e8f5e9; color: #2e7d32; }
    .chip-medium { background: #fff3e0; color: #e65100; }
    .chip-high { background: #fbe9e7; color: #c62828; }
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
    this.ticketService.update(t.id, { status }).subscribe((updated) => {
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
}
