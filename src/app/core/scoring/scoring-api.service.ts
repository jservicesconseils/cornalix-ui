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

@Injectable({ providedIn: 'root' })
export class ScoringApiService {
  private readonly http = inject(HttpClient);

  async getScore(organizationId: string): Promise<ScoreSnapshot> {
    const dto = await firstValueFrom(
      this.http.get<ScoreResponseDto>(
        `${API_BASE_URLS.scoring}/api/v1/scoring/organizations/${organizationId}/score`,
      ),
    );
    return {
      overallScore: toPercent(dto.overallScore),
      scoreByFunction: mapFractionsToPercent(dto.scoreByFunction ?? {}),
      scoreByCisControl: mapFractionsToPercent(dto.scoreByCisControl ?? {}),
    };
  }
}
