import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { OrgMember, UserRole } from '../models/user.model';

interface UserResponseDto {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'INVITED' | 'ACTIVE';
  createdAt: string;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function toOrgMember(dto: UserResponseDto): OrgMember {
  return { id: dto.id, name: dto.name, initials: initialsOf(dto.name), role: dto.role, email: dto.email, status: dto.status };
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  async list(organizationId: string): Promise<OrgMember[]> {
    const dtos = await firstValueFrom(
      this.http.get<UserResponseDto[]>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/users`),
    );
    return dtos.map(toOrgMember);
  }

  async invite(organizationId: string, email: string, name: string, role: UserRole): Promise<OrgMember> {
    const dto = await firstValueFrom(
      this.http.post<UserResponseDto>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/users`, {
        email,
        name,
        role,
      }),
    );
    return toOrgMember(dto);
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${API_BASE_URLS.identity}/api/v1/organizations/${organizationId}/users/${userId}`),
    );
  }
}
