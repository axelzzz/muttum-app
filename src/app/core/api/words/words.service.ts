import {
  HttpClient,
  HttpHeaders,
  HttpResponse as AngularHttpResponse
} from '@angular/common/http';
import type {
  HttpContext,
  HttpEvent,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import type {
  DeleteResult,
  GetApiWordsParams,
  GetApiWordsSearchParams,
  PatchApiWordsIdBody,
  SearchResult,
  UserWord,
  UserWordList
} from '../model';



interface HttpClientOptions {
  readonly headers?: HttpHeaders | Record<string, string | string[]>;
  readonly context?: HttpContext;
  readonly params?:
        | HttpParams
      | Record<string, string | number | boolean | Array<string | number | boolean>>;
  readonly reportProgress?: boolean;
  readonly withCredentials?: boolean;
  readonly credentials?: RequestCredentials;
  readonly keepalive?: boolean;
  readonly priority?: RequestPriority;
  readonly cache?: RequestCache;
  readonly mode?: RequestMode;
  readonly redirect?: RequestRedirect;
  readonly referrer?: string;
  readonly integrity?: string;
  readonly referrerPolicy?: ReferrerPolicy;
  readonly transferCache?: {includeHeaders?: string[]} | boolean;
  readonly timeout?: number;
}

type HttpClientBodyOptions = HttpClientOptions & {
  readonly observe?: 'body';
};

type HttpClientEventOptions = HttpClientOptions & {
  readonly observe: 'events';
};

type HttpClientResponseOptions = HttpClientOptions & {
  readonly observe: 'response';
};

type HttpClientObserveOptions = HttpClientOptions & {
  readonly observe?: 'body' | 'events' | 'response';
};

type AngularHttpParamValue = string | number | boolean | Array<string | number | boolean>;
type AngularHttpParamValueWithNullable = AngularHttpParamValue | null;

function filterParams(
  params: Record<string, unknown>,
  requiredNullableKeys?: ReadonlySet<string>,
  preserveRequiredNullables?: false,
  passthroughKeys?: undefined,
): Record<string, AngularHttpParamValue>;
function filterParams(
  params: Record<string, unknown>,
  requiredNullableKeys: ReadonlySet<string> | undefined,
  preserveRequiredNullables: true,
  passthroughKeys?: undefined,
): Record<string, AngularHttpParamValueWithNullable>;
function filterParams(
  params: Record<string, unknown>,
  requiredNullableKeys: ReadonlySet<string> | undefined,
  preserveRequiredNullables: boolean | undefined,
  passthroughKeys: ReadonlySet<string>,
): Record<string, unknown>;
function filterParams(
  params: Record<string, unknown>,
  requiredNullableKeys: ReadonlySet<string> = new Set(),
  preserveRequiredNullables = false,
  passthroughKeys: ReadonlySet<string> = new Set(),
): Record<string, unknown> {
  const filteredParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (passthroughKeys.has(key)) {
      if (value !== undefined) {
        filteredParams[key] = value;
      }
      continue;
    }
    if (Array.isArray(value)) {
      const filtered = value.filter(
        (item) =>
          item != null &&
          (typeof item === 'string' ||
            typeof item === 'number' ||
            typeof item === 'boolean'),
      ) as Array<string | number | boolean>;
      if (filtered.length) {
        filteredParams[key] = filtered;
      }
    } else if (
      preserveRequiredNullables &&
      value === null &&
      requiredNullableKeys.has(key)
    ) {
      filteredParams[key] = null;
    } else if (
      value != null &&
      (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean')
    ) {
      filteredParams[key] = value;
    }
  }
  return filteredParams;
}





@Injectable({ providedIn: 'root' })
export class WordsService {
  private readonly http = inject(HttpClient);
/**
 * @summary Search for a word and add it to the user's list
 */
 getApiWordsSearch<TData = SearchResult>(params: GetApiWordsSearchParams, options?: HttpClientBodyOptions): Observable<TData>;
 getApiWordsSearch<TData = SearchResult>(params: GetApiWordsSearchParams, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 getApiWordsSearch<TData = SearchResult>(params: GetApiWordsSearchParams, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  getApiWordsSearch<TData = SearchResult>(
    params: GetApiWordsSearchParams, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    const filteredParams = filterParams({...params, ...options?.params}, new Set<string>([]));

    if (options?.observe === 'events') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words/search`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
        params: filteredParams,}
    );
    }

    if (options?.observe === 'response') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words/search`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
        params: filteredParams,}
    );
    }

    return this.http.get<TData>(
      `http://localhost:3000/api/words/search`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
        params: filteredParams,}
    );
  }
/**
 * @summary List words in the user's dictionary
 */
 getApiWords<TData = UserWordList>(params?: GetApiWordsParams, options?: HttpClientBodyOptions): Observable<TData>;
 getApiWords<TData = UserWordList>(params?: GetApiWordsParams, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 getApiWords<TData = UserWordList>(params?: GetApiWordsParams, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  getApiWords<TData = UserWordList>(
    params?: GetApiWordsParams, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    const filteredParams = filterParams({...params, ...options?.params}, new Set<string>([]));

    if (options?.observe === 'events') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
        params: filteredParams,}
    );
    }

    if (options?.observe === 'response') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
        params: filteredParams,}
    );
    }

    return this.http.get<TData>(
      `http://localhost:3000/api/words`,{
    ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
        params: filteredParams,}
    );
  }
/**
 * @summary Get a single user word by ID
 */
 getApiWordsId<TData = UserWord>(id: string, options?: HttpClientBodyOptions): Observable<TData>;
 getApiWordsId<TData = UserWord>(id: string, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 getApiWordsId<TData = UserWord>(id: string, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  getApiWordsId<TData = UserWord>(
    id: string, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.get<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.get<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
/**
 * @summary Update notes, tags, or favorite on a user word
 */
 patchApiWordsId<TData = UserWord>(id: string,
    patchApiWordsIdBody?: PatchApiWordsIdBody, options?: HttpClientBodyOptions): Observable<TData>;
 patchApiWordsId<TData = UserWord>(id: string,
    patchApiWordsIdBody?: PatchApiWordsIdBody, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 patchApiWordsId<TData = UserWord>(id: string,
    patchApiWordsIdBody?: PatchApiWordsIdBody, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  patchApiWordsId<TData = UserWord>(
    id: string,
    patchApiWordsIdBody?: PatchApiWordsIdBody, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.patch<TData>(
      `http://localhost:3000/api/words/${id}`,
      patchApiWordsIdBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.patch<TData>(
      `http://localhost:3000/api/words/${id}`,
      patchApiWordsIdBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.patch<TData>(
      `http://localhost:3000/api/words/${id}`,
      patchApiWordsIdBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
/**
 * @summary Remove a word from the user's list
 */
 deleteApiWordsId<TData = DeleteResult>(id: string, options?: HttpClientBodyOptions): Observable<TData>;
 deleteApiWordsId<TData = DeleteResult>(id: string, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 deleteApiWordsId<TData = DeleteResult>(id: string, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  deleteApiWordsId<TData = DeleteResult>(
    id: string, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.delete<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.delete<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.delete<TData>(
      `http://localhost:3000/api/words/${id}`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
};

export type GetApiWordsSearchClientResult = NonNullable<SearchResult>
export type GetApiWordsClientResult = NonNullable<UserWordList>
export type GetApiWordsIdClientResult = NonNullable<UserWord>
export type PatchApiWordsIdClientResult = NonNullable<UserWord>
export type DeleteApiWordsIdClientResult = NonNullable<DeleteResult>
