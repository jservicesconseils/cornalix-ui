import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { NistFunctionKey } from '../models/organization.model';
import { mapFractionsToPercent, toPercent } from '../models/score.util';

interface ScoreResponseDto {
  organizationId: string;
  overallScore: number | null;
  scoreByFunction: Partial<Record<NistFunctionKey, number>>;
  scoreByCisControl: Record<string, number>;
}

export interface ScoreSnapshot {
  // null = aucune reponse exploitable pour l'organisation (distinct d'un
  // score de 0, voir ScoreResponse cote backend) -- a traiter differemment
  // a l'affichage plutot que d'être confondu avec "0%".
  overallScore: number | null;
  scoreByFunction: Partial<Record<NistFunctionKey, number>>;
  scoreByCisControl: Record<string, number>;
}

interface ScoreHistoryPointDto {
  date: string;
  overallScore: number | null;
}

export interface ScoreHistoryPoint {
  date: string;
  overallScore: number | null;
}

@Injectable({ providedIn: 'root' })
export class ScoringApiService {
  private readonly http = inject(HttpClient);

  async getScore(organizationId: string): Promise<ScoreSnapshot> {
    const dto = await firstValueFrom(
      this.http.get<ScoreResponseDto>(
        `${API_BASE_URLS.scoring}/api/v1/scoring/organizations/${organizationId}/score`,
      ),
    );
    return toSnapshot(dto);
  }

  // Tendance du score global dans le temps (SCRUM-47) -- au plus un
  // point par jour civil cote backend.
  async getHistory(organizationId: string): Promise<ScoreHistoryPoint[]> {
    const dtos = await firstValueFrom(
      this.http.get<ScoreHistoryPointDto[]>(
        `${API_BASE_URLS.scoring}/api/v1/scoring/organizations/${organizationId}/score/history`,
      ),
    );
    return dtos.map((dto) => ({ date: dto.date, overallScore: toPercent(dto.overallScore) }));
  }

  // Score de plusieurs organisations en un seul appel (SCRUM-43) --
  // remplace le pattern N+1 du Portefeuille Consultant (un getScore()
  // par organisation).
  async getScores(organizationIds: string[]): Promise<Record<string, ScoreSnapshot>> {
    const dtosByOrgId = await firstValueFrom(
      this.http.post<Record<string, ScoreResponseDto>>(
        `${API_BASE_URLS.scoring}/api/v1/scoring/organizations/batch-scores`,
        { organizationIds },
      ),
    );
    return Object.fromEntries(Object.entries(dtosByOrgId).map(([orgId, dto]) => [orgId, toSnapshot(dto)]));
  }
}

function toSnapshot(dto: ScoreResponseDto): ScoreSnapshot {
  return {
    overallScore: toPercent(dto.overallScore),
    scoreByFunction: mapFractionsToPercent(dto.scoreByFunction ?? {}),
    scoreByCisControl: mapFractionsToPercent(dto.scoreByCisControl ?? {}),
  };
}
