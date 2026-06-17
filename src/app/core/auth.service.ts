import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router }     from '@angular/router';
import { tap }        from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserInfo {
  token:  string;
  loai:   'NhanVien' | 'ChuNuoi';
  id:     number;
  hoTen:  string;
  vaiTro: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ── Signals: reactive state (Angular 21 style) ──────────────────
  private _user = signal<UserInfo | null>(this.loadFromStorage());

  // Computed signals – dùng trong templates và guards
  readonly user     = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => this._user() !== null);
  readonly isNhanVien  = computed(() => this._user()?.loai === 'NhanVien');
  readonly isChuNuoi   = computed(() => this._user()?.loai === 'ChuNuoi');
  readonly isAdmin     = computed(() => this._user()?.vaiTro === 'Admin');

  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, matKhau: string): Observable<UserInfo> {
    return this.http
      .post<UserInfo>(`${this.api}/auth/login`, { email, matKhau })
      .pipe(tap(u => this.save(u)));
  }

  register(payload: {
    hoTen: string; email: string; matKhau: string;
    soDienThoai?: string; diaChi?: string;
  }): Observable<UserInfo> {
    return this.http
      .post<UserInfo>(`${this.api}/auth/register`, payload)
      .pipe(tap(u => this.save(u)));
  }
  
  quenMatKhau(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/quenmatkhau`,
      { email }
    );
  }

  
  xacMinhOtp(email: string, otp: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/xacminhotp`,
      { email, otp }
    );
  }

 
  datLaiMatKhau(
    email: string,
    matKhauMoi: string,
    xacNhanMatKhau: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/datlaimatkhau`,
      { email, matKhauMoi, xacNhanMatKhau }
    );
  }

  logout(): void {
    localStorage.removeItem('pc_user');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this._user()?.token ?? null; }

  private save(u: UserInfo): void {
    localStorage.setItem('pc_user', JSON.stringify(u));
    this._user.set(u);
  }

  private loadFromStorage(): UserInfo | null {
    try {
      const raw = localStorage.getItem('pc_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}