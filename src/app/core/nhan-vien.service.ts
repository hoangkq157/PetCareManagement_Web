import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NhanVien } from './models';

@Injectable({ providedIn: 'root' })
export class NhanVienService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/nhanvien`;

  getAll(): Observable<NhanVien[]>                                   { return this.http.get<NhanVien[]>(this.api); }
  getById(id: number): Observable<NhanVien>                         { return this.http.get<NhanVien>(`${this.api}/${id}`); }
  create(item: Partial<NhanVien>): Observable<NhanVien>             { return this.http.post<NhanVien>(this.api, item); }
  update(id: number, item: Partial<NhanVien>): Observable<void>     { return this.http.put<void>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void>                              { return this.http.delete<void>(`${this.api}/${id}`); }
}
