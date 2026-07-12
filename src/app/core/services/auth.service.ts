import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '../models/user.model';

const TOKEN_KEY = 'muttum_token';
const USER_KEY = 'muttum_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  me(): Observable<{ user: User }> {
    return this.http
      .get<{ user: User }>(`${this.baseUrl}/me`)
      .pipe(tap(({ user }) => this._currentUser.set(user)));
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, payload);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._currentUser.set(res.user);
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
