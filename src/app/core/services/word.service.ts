import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UpdateWordPayload,
  UserWordPopulated,
  WordListParams,
  WordListResponse,
} from '../models/word.model';

@Injectable({ providedIn: 'root' })
export class WordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/words`;

  search(word: string): Observable<UserWordPopulated> {
    const params = new HttpParams().set('word', word);
    return this.http.get<UserWordPopulated>(`${this.baseUrl}/search`, { params });
  }

  list(query: WordListParams = {}): Observable<WordListResponse> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<WordListResponse>(this.baseUrl, { params });
  }

  getOne(id: string): Observable<UserWordPopulated> {
    return this.http.get<UserWordPopulated>(`${this.baseUrl}/${id}`);
  }

  update(id: string, payload: UpdateWordPayload): Observable<UserWordPopulated> {
    return this.http.patch<UserWordPopulated>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
