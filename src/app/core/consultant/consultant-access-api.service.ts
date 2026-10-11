import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';

export interface ConsultantAccess {
  id: string;
  organizationId: string;
  consultantEmail: string;
  grantedAt: string;
}

// Octroi/retrait d'acces d'un consultant a l'organisation courante
// (SCRUM-45) -- toujours initie par l'organisation (ADMIN_PME cote
// backend), jamais par le consultant lui-meme.
@Injectable({ providedIn: 'root' })
export class ConsultantAccessApiService {
  private readonly http = inject(HttpClient);

  async list(organizationId: string): Promise<ConsultantAccess[]> {
    return firstValueFrom(
      this.http.get<ConsultantAccess[]>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/consultants`),
    );
  }

  async grant(organizationId: string, email: string): Promise<ConsultantAccess> {
    return firstValueFrom(
      this.http.post<ConsultantAccess>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/consultants`, {
        email,
      }),
    );
  }

  async revoke(organizationId: string, accessId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/consultants/${accessId}`),
    );
  }
}
