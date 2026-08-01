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

@Component({
  selector: 'app-agent-ticket-detail-page',
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe, FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDividerModule, MatProgressSpinnerModule,
  ],
  template: `
    <div style="max-width:900px;margin:0 auto">
      <a mat-button routerLink="/agent" style="margin-bottom:1rem"><mat-icon>arrow_back</mat-icon> Volver</a>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:3rem"><mat-spinner diameter="40" /></div>
      } @else if (ticket(); as t) {
        <mat-card>
          <mat-card-content>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem">
              <h1 style="margin:0">#{{ t.id }} - {{ t.title }}</h1>
              <div style="display:flex;gap:0.5rem;align-items:center">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:160px">
                  <mat-label>Estado</mat-label>
                  <mat-select [value]="t.status" (selectionChange)="changeStatus(t, $event.value)">
                    @for (s of statuses; track s) {
                      <mat-option [value]="s">{{ statusLabel[s] }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;color:var(--mat-sys-on-surface-variant);font-size:0.875rem">
              <span><mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">person</mat-icon> {{ t.created_by_username }}</span>
              <span><mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">category</mat-icon> {{ t.category_name }}</span>
              <span><mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">flag</mat-icon> {{ t.priority | titlecase }}</span>
              <span><mat-icon style="font-size:16px;width:16px;height:16px;vertical-align:middle">calendar_today</mat-icon> {{ t.created_at | date:'medium' }}</span>
            </div>

            <mat-divider />
            <div style="margin:1rem 0;white-space:pre-wrap">{{ t.description }}</div>
          </mat-card-content>
        </mat-card>

        <h2 style="margin-top:2rem">Comentarios ({{ comments().length }})</h2>
        <mat-card>
          <mat-card-content>
            @for (c of comments(); track c.id) {
              <div style="padding:0.75rem 0">
                <div style="display:flex;justify-content:space-between;font-size:0.875rem;color:var(--mat-sys-on-surface-variant);margin-bottom:0.25rem">
                  <strong>{{ c.author_username }}</strong>
                  <span>{{ c.created_at | date:'medium' }}</span>
                </div>
                <div style="white-space:pre-wrap">{{ c.body }}</div>
              </div>
              @if (!$last) { <mat-divider /> }
            } @empty {
              <p style="color:var(--mat-sys-on-surface-variant)">Sin comentarios aún.</p>
            }

            <div style="display:flex;gap:0.5rem;align-items:flex-start;margin-top:1rem">
              <mat-form-field appearance="outline" style="flex:1" subscriptSizing="dynamic">
                <mat-label>Agregar comentario</mat-label>
                <textarea matInput [(ngModel)]="newCommentBody" rows="2" placeholder="Escriba un comentario..."></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="addComment()" [disabled]="!newCommentBody.trim()">Enviar</button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class AgentTicketDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private commentService = inject(CommentService);

  ticket = signal<Ticket | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  newCommentBody = '';
  statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  statusLabel: Record<TicketStatus, string> = { open: 'Abierto', in_progress: 'En Proceso', closed: 'Cerrado' };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getById(id).subscribe((t) => {
      this.ticket.set(t);
      this.loading.set(false);
    });
    this.commentService.getAll(id).subscribe((cs) => this.comments.set(cs));
  }

  changeStatus(t: Ticket, status: TicketStatus) {
    this.ticketService.update(t.id, { status }).subscribe((updated) => this.ticket.set(updated));
  }

  addComment() {
    const t = this.ticket();
    if (!t || !this.newCommentBody.trim()) return;
    this.commentService.create(t.id, { body: this.newCommentBody }).subscribe((c) => {
      this.comments.update((cs) => [...cs, c]);
      this.newCommentBody = '';
    });
  }
}
