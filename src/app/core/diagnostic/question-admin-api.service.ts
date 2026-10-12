import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { NistFunctionKey } from '../models/organization.model';

export type ImplementationGroup = 'IG1' | 'IG2' | 'IG3';

export interface AdminQuestion {
  id: string;
  cisControl: number;
  cisSafeguard: string;
  nistFunction: NistFunctionKey;
  implementationGroup: ImplementationGroup;
  translations: Record<string, string>;
}

export interface QuestionImportResult {
  created: number;
  updated: number;
  errors: { rowNumber: number; message: string }[];
}

export interface QuestionFormValue {
  cisControl: number;
  cisSafeguard: string;
  nistFunction: NistFunctionKey;
  implementationGroup: ImplementationGroup;
  translations: Record<string, string>;
}

// Ecran d'administration du catalogue de questions (menu Paramètres) --
// distinct de DiagnosticApiService, qui sert le consommateur du
// questionnaire (repondre), pas la gestion du catalogue lui-meme.
@Injectable({ providedIn: 'root' })
export class QuestionAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URLS.diagnostic}/api/v1/diagnostics/questions`;

  async listAll(): Promise<AdminQuestion[]> {
    return firstValueFrom(this.http.get<AdminQuestion[]>(this.baseUrl));
  }

  async create(value: QuestionFormValue): Promise<AdminQuestion> {
    return firstValueFrom(this.http.post<AdminQuestion>(this.baseUrl, value));
  }

  async update(id: string, value: QuestionFormValue): Promise<AdminQuestion> {
    return firstValueFrom(this.http.put<AdminQuestion>(`${this.baseUrl}/${id}`, value));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  async importCsv(file: File): Promise<QuestionImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<QuestionImportResult>(`${this.baseUrl}/import`, formData));
  }
}
