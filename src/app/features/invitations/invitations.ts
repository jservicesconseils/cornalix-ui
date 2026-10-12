import { Component, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';

import {
  ConsultantInvitation,
  ConsultantInvitationApiService,
} from '../../core/consultant/consultant-invitation-api.service';

@Component({
  selector: 'app-invitations',
  imports: [TableModule],
  templateUrl: './invitations.html',
  styleUrl: './invitations.scss',
})
export class Invitations {
  private readonly api = inject(ConsultantInvitationApiService);

  protected readonly invitations = signal<ConsultantInvitation[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  // Ids en cours de traitement (accepter/refuser) -- desactive les deux
  // boutons de la ligne pendant la requete, evite un double-clic qui
  // enverrait deux fois la meme reponse.
  protected readonly respondingIds = signal<Set<string>>(new Set());

  protected readonly pendingCount = computed(
    () => this.invitations().filter((invitation) => invitation.status === 'PENDING').length,
  );

  constructor() {
    this.loadInvitations();
  }

  protected async loadInvitations(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const invitations = await this.api.list();
      invitations.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
      this.invitations.set(invitations);
    } catch {
      this.loadError.set('Impossible de charger vos invitations.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async accept(invitation: ConsultantInvitation): Promise<void> {
    await this.respond(invitation, () => this.api.accept(invitation.id));
  }

  protected async decline(invitation: ConsultantInvitation): Promise<void> {
    if (!confirm(`Refuser l'invitation de ${invitation.organizationName} ?`)) {
      return;
    }
    await this.respond(invitation, () => this.api.decline(invitation.id));
  }

  private async respond(invitation: ConsultantInvitation, call: () => Promise<ConsultantInvitation>): Promise<void> {
    this.respondingIds.update((current) => new Set(current).add(invitation.id));
    try {
      const updated = await call();
      this.invitations.update((current) => current.map((i) => (i.id === updated.id ? updated : i)));
    } catch {
      alert("La réponse à l'invitation a échoué. Réessayez dans un instant.");
    } finally {
      this.respondingIds.update((current) => {
        const next = new Set(current);
        next.delete(invitation.id);
        return next;
      });
    }
  }

  protected statusLabel(status: ConsultantInvitation['status']): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'DECLINED':
        return 'Refusée';
    }
  }

  protected statusBadgeClass(status: ConsultantInvitation['status']): string {
    switch (status) {
      case 'PENDING':
        return 'badge--partial';
      case 'ACCEPTED':
        return 'badge--yes';
      case 'DECLINED':
        return 'badge--no';
    }
  }

  // Meme approche que questionnaire.ts/trend-chart.ts : pas de locale
  // francaise enregistree dans l'app, DatePipe retomberait sur l'anglais.
  protected formatDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}
