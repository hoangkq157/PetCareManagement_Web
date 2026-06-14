import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HoaDon } from './models';

@Injectable({ providedIn: 'root' })
export class HoaDonService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/hoaDon`;

  getAll(): Observable<HoaDon[]>                                 { return this.http.get<HoaDon[]>(this.api); }
  getById(id: number): Observable<HoaDon>                       { return this.http.get<HoaDon>(`${this.api}/${id}`); }
  getByChuNuoi(maCN: number): Observable<HoaDon[]>             { return this.http.get<HoaDon[]>(`${this.api}/bychuNuoi/${maCN}`); }
  create(item: Partial<HoaDon>): Observable<HoaDon>             { return this.http.post<HoaDon>(this.api, item); }
  update(id: number, item: Partial<HoaDon>): Observable<void>   { return this.http.put<void>(`${this.api}/${id}`, item); }
  thanhToan(id: number, phuongThuc: string): Observable<void>   { return this.http.patch<void>(`${this.api}/${id}/thanhtoan`, JSON.stringify(phuongThuc), { headers: { 'Content-Type': 'application/json' } }); }
  delete(id: number): Observable<void>                          { return this.http.delete<void>(`${this.api}/${id}`); }
}
