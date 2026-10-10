import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { Organization } from '../models/organization.model';

interface OrganizationResponseDto {
  id: string;
  name: string;
  createdAt: string;
}

// Champs absents du backend identity aujourd'hui (location, score) :
// remplis a vide/zero en attendant le branchement du scoring par
// organisation (ticket separe de l'epique SCRUM-25).
function toOrganization(dto: OrganizationResponseDto): Organization {
  return { id: dto.id, name: dto.name, location: '', score: 0 };
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
  // n'a aucun effet de bord sur l'appelant).
  async register(organizationName: string): Promise<Organization> {
    const dto = await firstValueFrom(
      this.http.post<OrganizationResponseDto>(`${API_BASE_URLS.identity}/api/v1/organizations/register`, {
        name: organizationName,
      }),
    );
    return toOrganization(dto);
  }
}
