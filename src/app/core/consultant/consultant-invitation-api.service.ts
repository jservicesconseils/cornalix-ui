import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { ConsultantAccessStatus } from './consultant-access-api.service';

export interface ConsultantInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  invitedByName: string | null;
  status: ConsultantAccessStatus;
  invitedAt: string;
  respondedAt: string | null;
}

// Cote consultant : consulter ses propres invitations et y repondre --
// distinct de ConsultantAccessApiService (cote organisation, qui
// octroie/retire). Le consultant n'agit que sur ses propres
// invitations, jamais besoin d'un organizationId en parametre.
@Injectable({ providedIn: 'root' })
export class ConsultantInvitationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URLS.identity}/api/v1/consultants/me/invitations`;

  async list(): Promise<ConsultantInvitation[]> {
    return firstValueFrom(this.http.get<ConsultantInvitation[]>(this.baseUrl));
  }

  async accept(id: string): Promise<ConsultantInvitation> {
    return firstValueFrom(this.http.post<ConsultantInvitation>(`${this.baseUrl}/${id}/accept`, {}));
  }

  async decline(id: string): Promise<ConsultantInvitation> {
    return firstValueFrom(this.http.post<ConsultantInvitation>(`${this.baseUrl}/${id}/decline`, {}));
  }
}
