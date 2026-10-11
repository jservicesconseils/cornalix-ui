import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { Organization } from '../models/organization.model';

interface OrganizationResponseDto {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
}

// score reste a 0 ici : le vrai score par organisation est recupere a
// part (ScoringApiService.getScores, en lot, SCRUM-43), jamais par
// cette API organisations elle-meme.
function toOrganization(dto: OrganizationResponseDto): Organization {
  return { id: dto.id, name: dto.name, location: dto.location ?? '', score: 0 };
}

@Injectable({ providedIn: 'root' })
export class OrganizationApiService {
  private readonly http = inject(HttpClient);

  async listMine(): Promise<Organization[]> {
    const dtos = await firstValueFrom(
      this.http.get<OrganizationResponseDto[]>(`${API_BASE_URLS.identity}/api/v1/organizations`),
    );
    return dtos.map(toOrganization);
  }

  // Auto-inscription (SCRUM-41) : cree l'organisation et fait de
  // l'appelant son premier ADMIN_PME (POST /api/v1/organizations/register,
  // cornalix-ms-identity -- distinct de POST /api/v1/organizations qui
  // n'a aucun effet de bord sur l'appelant). location est optionnel.
  async register(organizationName: string, location?: string): Promise<Organization> {
    const dto = await firstValueFrom(
      this.http.post<OrganizationResponseDto>(`${API_BASE_URLS.identity}/api/v1/organizations/register`, {
        name: organizationName,
        location: location?.trim() || null,
      }),
    );
    return toOrganization(dto);
  }
}
