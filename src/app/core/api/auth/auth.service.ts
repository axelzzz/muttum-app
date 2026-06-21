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
  AuthResponse,
  GetApiAuthMe200,
  PostApiAuthLoginBody,
  PostApiAuthRegisterBody
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







@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
/**
 * @summary Register a new user
 */
 postApiAuthRegister<TData = AuthResponse>(postApiAuthRegisterBody: PostApiAuthRegisterBody, options?: HttpClientBodyOptions): Observable<TData>;
 postApiAuthRegister<TData = AuthResponse>(postApiAuthRegisterBody: PostApiAuthRegisterBody, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 postApiAuthRegister<TData = AuthResponse>(postApiAuthRegisterBody: PostApiAuthRegisterBody, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  postApiAuthRegister<TData = AuthResponse>(
    postApiAuthRegisterBody: PostApiAuthRegisterBody, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.post<TData>(
      `http://localhost:3000/api/auth/register`,
      postApiAuthRegisterBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.post<TData>(
      `http://localhost:3000/api/auth/register`,
      postApiAuthRegisterBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.post<TData>(
      `http://localhost:3000/api/auth/register`,
      postApiAuthRegisterBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
/**
 * @summary Login and receive a JWT
 */
 postApiAuthLogin<TData = AuthResponse>(postApiAuthLoginBody: PostApiAuthLoginBody, options?: HttpClientBodyOptions): Observable<TData>;
 postApiAuthLogin<TData = AuthResponse>(postApiAuthLoginBody: PostApiAuthLoginBody, options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 postApiAuthLogin<TData = AuthResponse>(postApiAuthLoginBody: PostApiAuthLoginBody, options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  postApiAuthLogin<TData = AuthResponse>(
    postApiAuthLoginBody: PostApiAuthLoginBody, options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.post<TData>(
      `http://localhost:3000/api/auth/login`,
      postApiAuthLoginBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.post<TData>(
      `http://localhost:3000/api/auth/login`,
      postApiAuthLoginBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.post<TData>(
      `http://localhost:3000/api/auth/login`,
      postApiAuthLoginBody,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
/**
 * @summary Get the authenticated user's profile
 */
 getApiAuthMe<TData = GetApiAuthMe200>( options?: HttpClientBodyOptions): Observable<TData>;
 getApiAuthMe<TData = GetApiAuthMe200>( options?: HttpClientEventOptions): Observable<HttpEvent<TData>>;
 getApiAuthMe<TData = GetApiAuthMe200>( options?: HttpClientResponseOptions): Observable<AngularHttpResponse<TData>>;
  getApiAuthMe<TData = GetApiAuthMe200>(
     options?: HttpClientObserveOptions): Observable<TData | HttpEvent<TData> | AngularHttpResponse<TData>> {
    if (options?.observe === 'events') {
      return this.http.get<TData>(
      `http://localhost:3000/api/auth/me`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'events',
      }
    );
    }

    if (options?.observe === 'response') {
      return this.http.get<TData>(
      `http://localhost:3000/api/auth/me`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'response',
      }
    );
    }

    return this.http.get<TData>(
      `http://localhost:3000/api/auth/me`,{
        ...(options as Omit<NonNullable<typeof options>, 'observe'>),
        observe: 'body',
      }
    );
  }
};

